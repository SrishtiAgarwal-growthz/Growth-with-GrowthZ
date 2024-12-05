import { addCreativesTask } from "../services/taskService.js";
import { processAppImages } from "../services/creativesService.js";
// import { createAdsForAllImages } from "../services/creativesService.js";

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

export const createAdsForImagesController = async (req, res) => {
  try {
    const { email, key } = req.body;

    if (!email || !key) {
      return res.status(400).json({ message: "Email and key are required." });
    }

    console.log(`[CreativeController] Generating ads for email: ${email} with key: ${key}`);

    // Call the service to generate creatives
    const result = await createAdsForAllImages({ email, key });

    res.status(200).json({
      message: "Creatives generated successfully.",
      result,
    });
  } catch (error) {
    console.error("[CreativeController] Error generating creatives:", error.message);
    res.status(500).json({
      message: "Error generating creatives.",
      error: error.message,
    });
  }
};