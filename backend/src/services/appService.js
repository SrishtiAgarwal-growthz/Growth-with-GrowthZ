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
 *   - Initialize imagesProcessed = false so we know we haven't done remove-bg yet.
 *   - Then call processAppImages if you want to do it immediately inside this function
 *     (or you can call it from the controller).
 */
export const saveAppDetailsInDb = async (googlePlayUrl, appleAppUrl, websiteUrl = null) => {
  console.log("[saveAppDetailsInDb] Called with:", { googlePlayUrl, appleAppUrl, websiteUrl });

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  let appDetails = {
    recordCreated: new Date(),
    imagesProcessed: false, // NEW FLAG
    images: [],
  };

  // 1) Google scraping
  if (googlePlayUrl) {
    const googleAppId = extractGooglePlayAppId(googlePlayUrl);
    if (!googleAppId) throw new Error("Invalid Google Play URL.");

    console.log("[saveAppDetailsInDb] Scraping Google Play store details...");
    const googlePlayData = await retryWithBackoff(async () => {
      try {
        const data = await gplay.app({
          appId: googleAppId,
          throttle: 10, // Add throttling
        });
        console.log("[saveAppDetailsInDb] Successfully fetched Google Play data");
        return data;
      } catch (error) {
        console.error("[saveAppDetailsInDb] Google Play fetch error:", error);
        throw error;
      }
    });

    appDetails = {
      ...appDetails,
      appId: googlePlayData.appId,
      appName: googlePlayData.title,
      category: googlePlayData.genre,
      googleBundleId: googlePlayData.appId,
      googlePlayUrl: googlePlayData.url,
      googleReviews: googlePlayData.reviews,
      googleVersion: googlePlayData.version,
      iconUrl: googlePlayData.icon,
      images: googlePlayData.screenshots.map((screenshot) => ({
        screenshot,
        removed_bg_image: null, // Placeholder for future processing
      })),
      privacyPolicyUrl: googlePlayData.privacyPolicy,
      websiteUrl: googlePlayData.developerWebsite,
    };
  }

  // Fetch details from Apple App Store
  if (appleAppUrl) {
    const match = appleAppUrl.match(/\/id(\d+)(?:\/)?/);
    const appleId = match ? match[1] : null;

    if (!appleId) {
      console.warn("[saveAppDetailsInDb] Invalid Apple App Store URL, skipping Apple data fetch");
    } else {
      try {
        console.log("[saveAppDetailsInDb] Fetching Apple App Store details for ID:", appleId);

        const appleData = await store.app({
          id: appleId,
          country: 'in'  // Explicitly set country to India
        });

        console.log("[saveAppDetailsInDb] Successfully fetched Apple Store data");

        appDetails = {
          ...appDetails,
          appleAppUrl: appleData.url,
          appleBundleId: appleData.id,
          appleReviews: appleData.reviews,
          appleVersion: appleData.version,
        };
      } catch (error) {
        console.warn("[saveAppDetailsInDb] Apple Store fetch failed, continuing with Google data only:", error.message);
        // Don't throw error, continue with Google Play data
      }
    }
  }

  // 3) If direct website link
  if (websiteUrl) {
    appDetails.websiteLink = websiteUrl;
  }

  // 4) Upsert - Save to database
  console.log("[saveAppDetailsInDb] Saving app details to database...");
  await retryWithBackoff(async () => {
    await appsCollection.updateOne(
      { appId: appDetails.appId },
      { $set: appDetails },
      { upsert: true }
    );
  });

  console.log("[saveAppDetailsInDb] Saved app details to database.");

  const filter = {};
  if (appDetails.googleBundleId) filter.googleBundleId = appDetails.googleBundleId;
  else if (appDetails.appleBundleId) filter.appleBundleId = appDetails.appleBundleId;

  let savedApp = await appsCollection.findOne(filter);
  console.log("[saveAppDetailsInDb] Saved app =>", savedApp._id);

  // 5) Optionally call remove-bg once
  if (!savedApp.imagesProcessed) {
    console.log("[saveAppDetailsInDb] imagesProcessed is false => calling processAppImages...");
    try {
      // If you are *sure* you want to do it here:
      await processAppImages(savedApp._id);
      // If success => mark true
      await appsCollection.updateOne(
        { _id: savedApp._id },
        { $set: { imagesProcessed: true } }
      );
      console.log("[saveAppDetailsInDb] Marked imagesProcessed = true");
    } catch (err) {
      console.error("[saveAppDetailsInDb] Error processing images =>", err.message);
      // If you want to skip infinite retries, set imagesProcessed = true anyway:
      // await appsCollection.updateOne({ _id: savedApp._id }, { $set: { imagesProcessed: true } });
    }
  } else {
    console.log("[saveAppDetailsInDb] imagesProcessed already true => skip remove-bg calls.");
  }

  return await appsCollection.findOne({ _id: savedApp._id });
};
