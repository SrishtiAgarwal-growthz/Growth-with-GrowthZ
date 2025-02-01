import gplay from "google-play-scraper";
import store from "app-store-scraper";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId, extractAppleAppId } from "../utils/extractors.js";
import { processAppImages } from "./creativesService.js"; // We'll import from creativesService

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();``
  } catch (error) {
    if (retries === 0) throw error;

    console.log(`Retrying after ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));

    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

/**
 * fetchOrCreateApp:
 *   - Checks if app doc is already in `Apps` by googleBundleId or appleBundleId.
 *   - If found, returns it. If not, calls saveAppDetailsInDb to scrape + optionally remove-bg.
 */
export const fetchOrCreateApp = async (googlePlayUrl, appleAppUrl, websiteUrl = null) => {
  console.log("[fetchOrCreateApp] Checking for existing app in DB...");
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  let googleId = null;
  if (googlePlayUrl) googleId = extractGooglePlayAppId(googlePlayUrl);
  let appleId = null;
  if (appleAppUrl) appleId = extractAppleAppId(appleAppUrl);

  try {
    const query = {};
    if (googleId) query.googleBundleId = googleId;
    if (appleId) query.appleBundleId = appleId;

    // 1) Check if doc already exists
    const existing = await appsCollection.findOne(query);
    if (existing) {
      console.log("[fetchOrCreateApp] Found existing app => skip new scraping");
      return existing;
    }

    // 2) Otherwise, do new scraping
    console.log("[fetchOrCreateApp] No existing doc => calling saveAppDetailsInDb...");
    const newApp = await saveAppDetailsInDb(googlePlayUrl, appleAppUrl, websiteUrl);
    return newApp;
  } catch (error) {
    console.error("[fetchOrCreateApp] Error =>", error.message);
    throw error;
  } finally {
    await client.close();
  }
};


/**
 * saveAppDetailsInDb:
 *   - Scrape Google/Apple data, upsert in `Apps`.
 *   - If the doc is new or imagesProcessed is false, we do remove-bg on up to 5 screenshots.
 *   - We rely on processAppImages to set imagesProcessed=true **only** if all 5 succeed.
 */
export const saveAppDetailsInDb = async (googlePlayUrl, appleAppUrl, websiteUrl = null) => {
  console.log("[saveAppDetailsInDb] Called with:", { googlePlayUrl, appleAppUrl, websiteUrl });

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  // ------------------------------------------------------------
  // 1) Try to find if there's already an existing app doc
  // ------------------------------------------------------------
  let existingDoc = null;
  let googleAppId = null;
  let appleId = null;

  if (googlePlayUrl) {
    googleAppId = extractGooglePlayAppId(googlePlayUrl);
  }
  if (appleAppUrl) {
    // e.g. /id12345 => "12345"
    const match = appleAppUrl.match(/\/id(\d+)(?:\/)?/);
    appleId = match ? match[1] : null;
  }

  let existingQuery = null;
  if (googleAppId) {
    existingQuery = { googleBundleId: googleAppId };
  } else if (appleId) {
    existingQuery = { appleBundleId: Number(appleId) };
  }

  if (existingQuery) {
    existingDoc = await appsCollection.findOne(existingQuery);
    if (existingDoc) {
      console.log("[saveAppDetailsInDb] Found existing doc => _id:", existingDoc._id);
    }
  }

  // ------------------------------------------------------------
  // 2) Prepare base appDetails object
  // ------------------------------------------------------------
  const nowUTC = new Date(); // current UTC time
  const ISTOffset = 5.5 * 60 * 60 * 1000; // 5hr 30min in ms
  const createdAtIST = new Date(nowUTC.getTime() + ISTOffset);

  let appDetails = {
    // if doc already exists, keep imagesProcessed as is; else default false
    imagesProcessed: existingDoc?.imagesProcessed ?? false,
    recordCreated: existingDoc?.recordCreated || createdAtIST,
    images: existingDoc?.images || [],
  };

  if (existingDoc?.appId) {
    appDetails.appId = existingDoc.appId;
  }

  // ------------------------------------------------------------
  // 3) Google scraping
  // ------------------------------------------------------------
  if (googlePlayUrl) {
    if (!googleAppId) {
      throw new Error("Invalid Google Play URL.");
    }

    console.log("[saveAppDetailsInDb] Scraping Google Play store details...");
    const googlePlayData = await retryWithBackoff(async () => {
      const data = await gplay.app({
        appId: googleAppId,
        throttle: 10,
      });
      console.log("[saveAppDetailsInDb] Successfully fetched Google Play data");
      return data;
    });

    // Merge Google data into appDetails
    appDetails = {
      ...appDetails,
      appId: googlePlayData.appId, // used for upsert match too
      appName: googlePlayData.title,
      category: googlePlayData.genre,
      googleBundleId: googlePlayData.appId,
      googlePlayUrl: googlePlayData.url,
      googleReviews: googlePlayData.reviews,
      googleVersion: googlePlayData.version,
      iconUrl: googlePlayData.icon,
      // Overwrite images only if we actually retrieved new screenshots
      images: googlePlayData.screenshots.map((screenshot) => ({
        screenshot,
        removed_bg_image: null,
      })),
      privacyPolicyUrl: googlePlayData.privacyPolicy,
      websiteUrl: googlePlayData.developerWebsite,
    };
  }

  // ------------------------------------------------------------
  // 4) Apple scraping (only if appleAppUrl is provided)
  // ------------------------------------------------------------
  if (appleAppUrl && appleId) {
    try {
      console.log("[saveAppDetailsInDb] Fetching Apple App Store details for ID:", appleId);
      const appleData = await store.app({
        id: appleId,
        country: "in",
      });

      console.log("[saveAppDetailsInDb] Successfully fetched Apple Store data");
      appDetails = {
        ...appDetails,
        appleAppUrl: appleData.url,
        appleBundleId: appleData.id, // numeric
        appleReviews: appleData.reviews,
        appleVersion: appleData.version,
      };
    } catch (error) {
      console.warn("[saveAppDetailsInDb] Apple Store fetch failed, continuing with Google data only:", error.message);
      // do not throw => continue
    }
  }

  // ------------------------------------------------------------
  // 5) If a direct website link is provided
  // ------------------------------------------------------------
  if (websiteUrl) {
    // Merge or set the website link
    appDetails.websiteLink = websiteUrl;
  }

  // ------------------------------------------------------------
  // 6) Perform Upsert by 'appId' (from Google data) if we have it
  // ------------------------------------------------------------
  console.log("[saveAppDetailsInDb] Saving app details to database...");
  await retryWithBackoff(async () => {
    await appsCollection.updateOne(
      { appId: appDetails.appId },
      { $set: appDetails },
      { upsert: true }
    );
  });

  console.log("[saveAppDetailsInDb] Saved app details to database.");

  // Reload to get the final doc
  const filter = {};
  if (appDetails.googleBundleId) {
    filter.googleBundleId = appDetails.googleBundleId;
  } else if (appDetails.appleBundleId) {
    filter.appleBundleId = appDetails.appleBundleId;
  }

  let savedApp = await appsCollection.findOne(filter);
  if (!savedApp) {
    throw new Error("Failed to save or retrieve the app after upsert.");
  }
  console.log("[saveAppDetailsInDb] Saved app =>", savedApp._id);

  // ------------------------------------------------------------
  // 7) Optionally call remove-bg once if imagesProcessed is false
  //    We rely on processAppImages itself to set imagesProcessed = true
  // ------------------------------------------------------------
  if (!savedApp.imagesProcessed) {
    console.log("[saveAppDetailsInDb] imagesProcessed is false => calling processAppImages...");
    try {
      // Perform the background removal
      await processAppImages(savedApp._id);
    } catch (err) {
      console.error("[saveAppDetailsInDb] Error processing images =>", err.message);
      // If you want to skip infinite retries, you can handle it differently,
      // but do NOT set imagesProcessed = true if we failed to process them.
    }
  } else {
    console.log("[saveAppDetailsInDb] imagesProcessed already true => skip remove-bg calls.");
  }

  // Return the final doc
  return await appsCollection.findOne({ _id: savedApp._id });
};
