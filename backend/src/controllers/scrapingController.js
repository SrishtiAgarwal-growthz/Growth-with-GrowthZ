import * as scrapeService from '../services/scrapingService.js';

export const scrapeAndStoreImages = async (req, res) => {
  const { email, google_play, apple_app } = req.body;

  if (!google_play) {
    return res.status(400).send('Google Play Store URL is required');
  }

  try {
    await scrapeService.handleScraping(email, google_play, apple_app);
    return res.status(200).send('Scraping and storing completed.');
  } catch (error) {
    return res.status(500).json({ message: "Error occurred during scraping.", error: error.message });
  }
};
