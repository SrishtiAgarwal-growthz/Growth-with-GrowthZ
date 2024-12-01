import { saveAppDetailsInDb } from "../services/appService.js";

export const saveAppDetails = async (req, res) => {
  try {
    const { google_play, apple_app } = req.body;

    // Ensure at least one URL is provided
    if (!google_play && !apple_app) {
      return res.status(400).json({
        message: "Please provide either a Google Play or Apple App Store URL.",
      });
    }

    // Fetch and save app details
    const appDetails = await saveAppDetailsInDb(google_play, apple_app);

    // // Save task for the logged-in user
    // const userId = req.user.id; // User ID from JWT token
    // const task = await saveTask(userId, appDetails.appId);

    res.status(201).json({
      message: "App details saved successfully.",
      appDetails,
    });
  } catch (error) {
    console.error("[saveAppDetails] Error:", error.message);
    res.status(500).json({
      message: "Error saving app details.",
      error: error.message,
    });
  }
};
