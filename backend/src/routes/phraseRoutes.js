import express from "express";
import { createPhrases, updatePhrase } from "../controllers/phraseController.js";

const router = express.Router();

// Protected routes for phrases
router.post("/create", createPhrases); // Save phrases
router.put("/update", updatePhrase);  // Update phrase status

export default router;
