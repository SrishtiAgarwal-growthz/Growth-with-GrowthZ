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

    // Validate URL format
    if (google_play && !google_play.includes('play.google.com')) {
      return res.status(400).json({
        message: "Invalid Google Play Store URL format.",
      });
    }

    if (apple_app && !apple_app.includes('apps.apple.com')) {
      return res.status(400).json({
        message: "Invalid Apple App Store URL format.",
      });
    }

    console.log("[AppController] saveAppDetails => body:", req.body);

    // 1) Save app details with retries
    let attempts = 0;
    let savedApp;

    while (attempts < 3) {
      try {
        savedApp = await saveAppDetailsInDb(google_play, apple_app);
        break;
      } catch (error) {
        attempts++;
        if (attempts === 3) throw error;
        console.log(`[AppController] Retry attempt ${attempts} for saveAppDetailsInDb`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    const appIdFromResponse = savedApp._id;
    if (!appIdFromResponse) {
      throw new Error("App ID not returned from saveAppDetails.");
    }

    // 2) Process images if needed
    const result = await processAppImages(appIdFromResponse);

    // Return success even if Apple data fetch failed
    return res.status(201).json({
      message: "App details saved successfully.",
      note: !savedApp.appleBundleId && apple_app ? 
        "Note: Apple App Store data could not be fetched, but Google Play data was saved successfully." : 
        undefined,
      appDetails: savedApp,
    });
  } catch (error) {
    console.error("[saveAppDetails] Error:", error.message);

    // Send appropriate error response based on error type
    if (error.message.includes('404')) {
      return res.status(404).json({
        message: "App not found in store. Please verify the URL and try again.",
        error: error.message,
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        message: "Too many requests. Please try again in a few minutes.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Error saving app details.",
      error: error.message,
    });
  }
};
