import { addCreativesTask } from "../services/taskService.js";
import { processAppImages } from "../services/creativesService.js";
import { generateAdImages } from "../services/creativesService.js";

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
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ message: "App ID is required." });
    }

    console.log(`[CreativesController] Creating ads for app: ${appId}`);

    // Call service to generate ads
    const ads = await generateAdImages(appId);

    res.status(200).json({
      message: "Ads generated successfully.",
      ads,
    });
  } catch (error) {
    console.error("[CreativesController] Error generating ads:", error.message);
    res.status(500).json({ message: "Error generating ads.", error: error.message });
  }
};