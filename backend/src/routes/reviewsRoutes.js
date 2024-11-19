// src/routes/reviewsRoutes.js
import express from 'express';
import { generateUSPhrasesHandler } from '../controllers/reviewsController.js'; // Ensure this controller exists and is implemented

const router = express.Router();

// Route to generate USP phrases
router.post('/generate-phrases', generateUSPhrasesHandler);

export default router;
