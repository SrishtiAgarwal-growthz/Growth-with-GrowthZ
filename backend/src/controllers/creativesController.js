import { addCreativesTask } from "../services/taskService.js";
import { processAppImages, generateAdImages } from "../services/creativesService.js";

export const processImagesForApp = async (req, res) => {
  try {
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ message: "App ID is required." });
    }

    console.log(`[CreativesController] Processing images for app: ${appId}`);

    // Call the service to process app images
    const updatedImages = await processAppImages(appId);

    res.status(200).json({
      message: "Images processed successfully.",
      updatedImages,
    });
  } catch (error) {
    console.error("[CreativesController] Error handling 'Generate Creatives' request:", error.message);
    res.status(500).json({ message: "Error processing images.", error: error.message });
  }
};

export const addCreativeToTasks = async (req, res) => {
  try {
    const { userId, appId } = req.body;

    console.log("[CreativesController] Handling 'Generate Creatives' request...");
    await addCreativesTask(userId, appId, "Creatives");

    res.status(200).json({ message: "'Creatives' task added successfully to tasks array!" });
  } catch (error) {
    console.error("[CreativesController] Error handling 'Generate Creatives' request:", error.message);
    res.status(500).json({ message: "Error adding 'Creatives' task.", error: error.message });
  }
};

export const createAds = async (req, res) => {
  try {
    console.log("[CreativesController] Received request to create ads.");
    
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ message: "App ID is required." });
    }

    console.log(`[CreativesController] Creating ads for app: ${appId}`);

    // Call service to generate ads
    const ads = await generateAdImages(appId);
    console.log(`[CreativesController] Ads generated successfully for app ID: ${appId}`, ads);

    res.status(200).json({
      message: "Ads generated successfully.",
      ads,
    });
  } catch (error) {
    // Log the error details for debugging
    console.error("[CreativesController] Error occurred while generating ads:", error.message);
    console.error("[CreativesController] Error stack trace:", error.stack);

    // Respond with a 500 status code and the error message
    res.status(500).json({ message: "Error generating ads.", error: error.message });
  }
};
