import express from "express";
import { addCreativeToTasks } from "../controllers/creativesController.js";
import { processImagesForApp } from "../controllers/creativesController.js";
import { createAdsForImagesController } from "../controllers/creativesController.js";

const router = express.Router();

router.post("/addToTasks", addCreativeToTasks);
router.post("/process-images", processImagesForApp);
router.post("/create-ads", createAdsForImagesController);

export default router;
