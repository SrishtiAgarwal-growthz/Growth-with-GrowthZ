import express from "express";
import { addCreativeToTasks, processImagesForApp, createAds } from "../controllers/creativesController.js";

const router = express.Router();

// Add "Creative" to tasks
router.post("/addCreativeToTasks", addCreativeToTasks);

// Process creative elements
router.post("/process-images", processImagesForApp);

// Create Ads
router.post("/createAd", createAds);

export default router;
