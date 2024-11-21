import {
  generateUSPhrases,
  scrapeGooglePlayReviews,
  scrapeAppleStoreReviews,
  fetchAppNameFromGooglePlay,
} from "../services/reviewsService.js";
import { extractGooglePlayAppId, extractAppleAppId } from "../utils/extractors.js";

export const generateUSPhrasesHandler = async (req, res) => {
  console.log("[generateUSPhrasesHandler] Initial Request Body:", req.body);

  if (!req.body) {
    console.error("[generateUSPhrasesHandler] Error: req.body is undefined");
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { google_play, apple_app } = req.body;

  if (!google_play) {
    return res.status(400).json({ message: "Google Play Store URL is mandatory" });
  }

  try {
    const googleAppId = extractGooglePlayAppId(google_play);
    if (!googleAppId) throw new Error("[generateUSPhrasesHandler] Invalid Google Play App ID");
    console.log(`[generateUSPhrasesHandler] Google App ID: ${googleAppId}`);

    const appName = await fetchAppNameFromGooglePlay(googleAppId);
    if (!appName) throw new Error("Unable to extract app name from Google Play URL.");
    console.log(`[generateUSPhrasesHandler] App Name: ${appName}`);

    const googlePlayReviews = await scrapeGooglePlayReviews(google_play);
    console.log(`[generateUSPhrasesHandler] Total Google Reviews: ${googlePlayReviews.length}`);

    let appleStoreReviews = [];
    if (apple_app) {
      const appleAppId = extractAppleAppId(apple_app);
      appleStoreReviews = await scrapeAppleStoreReviews(appleAppId, "in", appName);
      console.log(`[generateUSPhrasesHandler] Total Apple Reviews: ${appleStoreReviews.length}`);
    } else {
      console.warn("[generateUSPhrasesHandler] Apple App Store URL not provided. Skipping.");
    }

    const combinedReviews = googlePlayReviews.concat(appleStoreReviews);
    console.log(`[generateUSPhrasesHandler] Total Combined Reviews: ${combinedReviews.length}`);

    const uspPhrases = await generateUSPhrases(appName, combinedReviews.join("\n"));
    res.json({
      status: "success",
      totalGoogleReviews: googlePlayReviews.length,
      totalAppleReviews: appleStoreReviews.length,
      totalReviews: combinedReviews.length,
      uspPhrases,
    });
  } catch (error) {
    console.error("[generateUSPhrasesHandler] Error:", error.message);
    res.status(500).json({ message: "Error generating USP phrases", error: error.message });
  }
};
