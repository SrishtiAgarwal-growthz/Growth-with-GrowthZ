import express from "express";
import { addCreativeToTasks, processImagesForApp, createAds, createAnimations } from "../controllers/creativesController.js";
import { getAdsForApp } from "../controllers/creativesController.js";

const router = express.Router();

// Add "Creative" to tasks
router.post("/addCreativeToTasks", addCreativeToTasks);

// Process creative elements
router.post("/process-images", processImagesForApp);

// Create Ads
router.post("/createAd", createAds);

// Create Ads
router.post("/createAnimation", createAnimations);

// NEW route:
router.get("/get-ads", getAdsForApp);

export default router;
