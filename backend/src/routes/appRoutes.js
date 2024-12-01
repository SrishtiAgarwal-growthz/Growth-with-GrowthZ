import express from "express";
import { saveAppDetails } from "../controllers/appController.js";

const router = express.Router();

// Route to handle Google Play or Apple App URLs
router.post("/save-app", saveAppDetails);

export default router;
