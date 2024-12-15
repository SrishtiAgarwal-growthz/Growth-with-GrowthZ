import gplay from "google-play-scraper";
import store from "app-store-scraper";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId } from "../utils/extractors.js";

export const saveAppDetailsInDb = async (googlePlayUrl, appleAppUrl) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const collection = db.collection("Apps");

  let appDetails = {
    recordCreated: new Date(),
    images: [], // Will hold screenshots and removed_bg_image
  };

  // Fetch details from Google Play Store
  if (googlePlayUrl) {
    const googleAppId = extractGooglePlayAppId(googlePlayUrl);
    if (!googleAppId) {
      throw new Error("Invalid Google Play Store URL.");
    }

    console.log("[saveAppDetailsInDb] Fetching Google Play Store details...");
    const googlePlayData = await gplay.app({ appId: googleAppId });

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
    const match = appleAppUrl.match(/id(\d+)/); // Extract ID from Apple URL
    const appleAppId = match ? match[1] : null;

    if (!appleAppId) {
      throw new Error("Invalid Apple App Store URL.");
    }

    console.log("[saveAppDetailsInDb] Fetching Apple App Store details...");
    const appleData = await store.app({ id: appleAppId });

    appDetails = {
      ...appDetails,
      appleAppUrl: appleData.url,
      appleBundleId: appleData.id,
      appleReviews: appleData.reviews,
      appleVersion: appleData.version,
    };
  }

  // Save to database
  console.log("[saveAppDetailsInDb] Saving app details to database...");
  const result = await collection.updateOne(
    { appId: appDetails.appId }, // Query to find the document by appId
    { $set: appDetails }, // Update the document with appDetails
    { upsert: true } // Create a new document if it doesn’t exist
  );

  // Fetch the document to ensure `_id` is returned
  const savedApp = await collection.findOne({ appId: appDetails.appId });
  
  console.log("[saveAppDetailsInDb] Saved app details to database:", savedApp);
  return savedApp; // Return the complete saved document, including `_id`
};
