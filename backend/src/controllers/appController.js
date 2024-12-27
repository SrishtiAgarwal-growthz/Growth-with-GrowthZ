import { saveAppDetailsInDb } from "../services/appService.js";
import { processAppImages } from "../services/creativesService.js";

/**
 * POST /api/app/save-app
 * - Scrapes the app (Google/Apple) with saveAppDetailsInDb
 * - Then calls processAppImages once
 * - If imagesProcessed is set, next time it won't re-run remove-bg
 */
export const saveAppDetails = async (req, res) => {
  try {
    const { google_play, apple_app } = req.body;

    // Ensure at least one URL is provided
    if (!google_play && !apple_app) {
      return res.status(400).json({
        message: "Please provide either a Google Play or Apple App Store URL.",
      });
    }

    console.log("[AppController] saveAppDetails => body:", req.body);

    // 1) Scrape & store app details. This sets imagesProcessed = false initially if new
    const appDetails = await saveAppDetailsInDb(google_play, apple_app);

    // 2) Immediately call remove-bg (only if not done). 
    // processAppImages itself checks appDoc.imagesProcessed and decides.
    const result = await processAppImages(appDetails._id);

    return res.status(201).json({
      message: "App details saved successfully.",
      appDetails,
      processResult: result,
    });
  } catch (error) {
    console.error("[saveAppDetails] Error:", error.message);
    return res.status(500).json({
      message: "Error saving app details.",
      error: error.message,
    });
  }
};
