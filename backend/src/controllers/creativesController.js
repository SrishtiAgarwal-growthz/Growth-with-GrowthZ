import * as creativeService from '../services/creativesService.js';

export const generateCreatives = async (req, res) => {
  const { email, google_play } = req.body;

  if (!email || !google_play) {
    return res.status(400).json({ message: 'Email and Google Play URL are required' });
  }

  try {
    const key = google_play.replace(/\./g, '_');
    const success = await createAdsForAllImages({ email, key });
    if (success) {
      res.status(200).json({ showCreativesButton: true });
    } else {
      res.status(500).json({ message: 'No creatives generated' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error generating creatives.', error: error.message });
  }
};

export const getCreatives = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required to fetch creatives' });
  }

  try {
    const response = await creativeService.fetchCreatives(email);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching creatives.' });
  }
};
