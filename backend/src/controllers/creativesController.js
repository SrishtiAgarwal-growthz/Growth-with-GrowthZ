import { connectToMongo } from "../config/db.js";
import { addCreativesTask } from "../services/taskService.js";
import { processAppImages, generateAdImages, generateAdAnimation } from "../services/creativesService.js";
import { ObjectId } from "mongodb";

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

export const createAnimations = async (req, res) => {
  try {
    console.log("[CreativesController] Received request to create animations.");

    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({ message: "App ID is required." });
    }

    console.log(`[CreativesController] Generating animations for app: ${appId}`);

    // Call service to generate animations
    const animationAds = await generateAdAnimation(appId);
    console.log(`[CreativesController] Animation ads generated successfully for app ID: ${appId}`, animationAds);

    res.status(200).json({
      message: "Animation creatives generated successfully.",
      animationAds,
    });
  } catch (error) {
    // Log the error details for debugging
    console.error("[CreativesController] Error occurred while generating ads:", error.message);
    console.error("[CreativesController] Error stack trace:", error.stack);

    // Respond with a 500 status code and the error message
    res.status(500).json({ message: "Error generating ads.", error: error.message });
  }
};

export const getAdsForApp = async (req, res) => {
  try {
    const { appId } = req.query;  // from ?appId=...
    if (!appId) {
      return res.status(400).json({ message: "Missing appId query parameter" });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const appCollection = db.collection("Apps");
    const creativesCollection = db.collection("Creatives");

    const app = await appCollection.findOne({ _id: new ObjectId(appId) });
    const appName = app.appName;
    
    // Find a Creatives document for this appId. Usually you store it as a string, so compare directly:
    const doc = await creativesCollection.findOne({ appId }); 

    if (!doc) {
      return res.status(404).json({ message: "No creatives found for this appId" });
    }

    // doc.adUrls is typically an array of objects with { creativeUrl, status }, or you might store them differently
    res.status(200).json({
      appId: doc.appId,
      appName: appName,
      ads: doc.adUrls || [],
      createdAt: doc.createdAt,
    });
  } catch (error) {
    console.error("[getAdsForApp] Error:", error);
    return res.status(500).json({ message: "Error fetching ads", error: error.message });
  }
};