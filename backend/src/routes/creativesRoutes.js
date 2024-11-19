import express from 'express';
import * as scrapeController from '../controllers/scrapingController.js';
import * as creativeController from '../controllers/creativesController.js';

const router = express.Router();

// Scrape Routes
router.post('/scrape', scrapeController.scrapeAndStoreImages);

// Creative Routes
router.post('/oneSixty', creativeController.generateCreatives);
router.post('/getCreatives', creativeController.getCreatives);

export default router;