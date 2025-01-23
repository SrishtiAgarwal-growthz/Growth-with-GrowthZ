// src/routes/reviewsRoutes.js
import express from 'express';
import { generateUSPhrasesHandler, generateWebsiteAdCopies } from '../controllers/reviewsController.js'; // Ensure this controller exists and is implemented

const router = express.Router();

// Route to generate USP phrases
router.post('/generate-phrases', generateUSPhrasesHandler);

router.post('/generate-website-copies', generateWebsiteAdCopies);

export default router;
