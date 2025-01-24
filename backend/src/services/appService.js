import gplay from "google-play-scraper";
import store from "app-store-scraper";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId, extractAppleAppId } from "../utils/extractors.js";
import { processAppImages } from "./creativesService.js"; // We'll import from creativesService

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
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
 *   - Preserve imagesProcessed if the app already exists; otherwise defaults to false.
 *   - Optionally calls remove-bg (processAppImages) if imagesProcessed is still false.
 */
export const saveAppDetailsInDb = async (googlePlayUrl, appleAppUrl, websiteUrl = null) => {
  console.log("[saveAppDetailsInDb] Called with:", {googlePlayUrl, appleAppUrl, websiteUrl});

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  // ------------------------------------------------------------
  // 1) Try to find if there's already an existing app doc
  //    (by googleBundleId or appleBundleId).
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

  // Attempt a find by either googleBundleId or appleBundleId
  let existingQuery = null;
  if (googleAppId) {
    existingQuery = { googleBundleId: googleAppId };
  } else if (appleId) {
    existingQuery = { appleBundleId: Number(appleId) }; 
    // 'id' from app-store-scraper is numeric
  }

  if (existingQuery) {
    existingDoc = await appsCollection.findOne(existingQuery);
    if (existingDoc) {
      console.log("[saveAppDetailsInDb] Found existing doc => _id:", existingDoc._id);
    }
  }

  // ------------------------------------------------------------
  // 2) Prepare base appDetails object
  //    (Preserve imagesProcessed if doc is found)
  // ------------------------------------------------------------
  let appDetails = {
    // On brand-new docs, set imagesProcessed to false initially
    imagesProcessed: existingDoc?.imagesProcessed ?? false,
    recordCreated: existingDoc?.recordCreated || new Date(),
    images: existingDoc?.images || [],
  };

  // If the existing doc has a known appId, keep it
  // or we'll fill it below when we scrape Google
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
      console.warn(
        "[saveAppDetailsInDb] Apple Store fetch failed, continuing with Google data only:",
        error.message
      );
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
  // ------------------------------------------------------------
  if (!savedApp.imagesProcessed) {
    console.log("[saveAppDetailsInDb] imagesProcessed is false => calling processAppImages...");
    try {
      // Perform the background removal
      await processAppImages(savedApp._id);
      // If success => mark true
      await appsCollection.updateOne(
        { _id: savedApp._id },
        { $set: { imagesProcessed: true } }
      );
      console.log("[saveAppDetailsInDb] Marked imagesProcessed = true");
    } catch (err) {
      console.error("[saveAppDetailsInDb] Error processing images =>", err.message);
      // If you want to skip infinite retries, you could:
      // await appsCollection.updateOne({ _id: savedApp._id }, { $set: { imagesProcessed: true } });
    }
  } else {
    console.log("[saveAppDetailsInDb] imagesProcessed already true => skip remove-bg calls.");
  }

  // Return the final doc
  return await appsCollection.findOne({ _id: savedApp._id });
};