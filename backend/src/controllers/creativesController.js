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
    const updatedImages = await processAppImages(appId, userId);

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

    const { appId, userId } = req.body;

    if (!appId || !userId) {
      return res.status(400).json({ message: "App ID and User ID is required." });
    }

    console.log(`[CreativesController] Creating ads for app: ${appId}`);

    // Call service to generate ads
    const ads = await generateAdImages(appId, userId);
    console.log(`[CreativesController] Ads generated successfully for app ID: ${appId}`, ads);

    res.status(200).json({
      message: "Ads generated successfully.",
      userId,
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

    const { appId, userId } = req.body;

    if (!appId || !userId) {
      return res.status(400).json({ message: "App ID and User ID is required." });
    }

    console.log(`[CreativesController] Creating animated ads for app: ${appId}`);

    // Call service to generate ads
    const animations = await generateAdAnimation(appId, userId);
    console.log(`[CreativesController] Animations generated successfully for app ID: ${appId}`, animations);

    res.status(200).json({
      message: "Animations generated successfully.",
      userId,
      animations,
    });
  } catch (error) {
    // Log the error details for debugging
    console.error("[CreativesController] Error occurred while generating animations:", error.message);
    console.error("[CreativesController] Error stack trace:", error.stack);

    // Respond with a 500 status code and the error message
    res.status(500).json({ message: "Error generating ads.", error: error.message });
  }
};

export const getAdsForApp = async (req, res) => {
  try {
    const { appId, userId } = req.query;   // or req.body
    if (!appId || !userId) {
      return res.status(400).json({ message: "Missing appId or userId" });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const appCollection = db.collection("Apps");
    const creativesCollection = db.collection("Creatives");

    // 1) Find the app to get name / icon / etc.
    const app = await appCollection.findOne({ _id: new ObjectId(appId) });
    if (!app) {
      return res.status(404).json({ message: "App not found for this appId" });
    }

    // 2) Extract the first available textColor from processed images
    const firstProcessedImage = app.images.find(image => image.removedBgUrl && image.textColor);

    // 3) Find the *user-specific* creative doc
    const doc = await creativesCollection.findOne({ userId, appId });
    if (!doc) {
      return res.status(404).json({ message: "No creatives found for this user/app" });
    }

    // Return user’s own ads
    res.status(200).json({
      appId: doc.appId,
      userId: doc.userId,
      appName: app.appName,
      logo: app.iconUrl,
      website: app.websiteUrl,
      textColor: firstProcessedImage ? firstProcessedImage.textColor : "#FFFFFF",
      ads: doc.adUrls || [],
      animations: doc.animationUrls || [],
      createdAt: doc.createdAt,
    });
  } catch (error) {
    console.error("[getAdsForApp] Error:", error.message);
    res.status(500).json({ message: "Error fetching ads", error: error.message });
  }
};
