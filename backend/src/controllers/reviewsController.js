import { generateUSPhrases, scrapeGooglePlayReviews, scrapeAppleStoreReviews, getAppNameFromGooglePlay } from '../services/reviewsService.js';
import { combineReviews } from '../utils/extractors.js';

export const generateUSPhrasesHandler = async (req, res) => {
  const { google_play, apple_app } = req.body;

  if (!google_play) {
    return res.status(400).json({ message: 'Google Play Store URL is mandatory' });
  }

  try {
    // Extract app name from the Google Play URL
    const appName = await getAppNameFromGooglePlay(google_play);
    if (!appName) {
      return res.status(400).json({ message: 'Unable to extract app name from Google Play URL.' });
    }

    // Fetch reviews from Google Play and Apple App Store
    const googlePlayReviews = await scrapeGooglePlayReviews(google_play);
    const appleStoreReviews = apple_app ? await scrapeAppleStoreReviews(apple_app) : [];
    
    // Combine reviews from both platforms
    const combinedReviews = combineReviews(googlePlayReviews, appleStoreReviews);

    // Generate USP phrases
    const uspPhrases = await generateUSPhrases(appName, combinedReviews);

    res.status(200).json(uspPhrases);
  } catch (error) {
    console.error('Error generating USP phrases:', error);
    res.status(500).json({ message: 'Error generating USP phrases', error: error.message });
  }
};
