import { extractGooglePlayAppId, extractAppleAppId, combineReviews } from '../utils/extractors.js';
import gplay from 'google-play-scraper';
import axios from 'axios';

export const handleUSPGeneration = async (google_play, apple_app) => {
  const appName = await gplay.app({ appId: extractGooglePlayAppId(google_play) }).title;
  const googleReviews = await gplay.reviews({ appId: extractGooglePlayAppId(google_play), sort: gplay.sort.NEWEST });
  const appleReviews = apple_app ? await appleReviews(apple_app) : [];
  const combinedReviews = combineReviews(googleReviews.data, appleReviews);

  return generateUSPhrases(appName, combinedReviews);
};

export const getAppNameFromGooglePlay = async (url) => {
  const match = url.match(/id=([a-zA-Z0-9._]+)/); // Extract app ID from URL
  if (!match) {
    console.error('Invalid Google Play URL');
    return null;
  }

  const appId = match[1];
  try {
    const appDetails = await gplay.app({ appId });
    console.log('App Name:', appDetails.title);
    return appDetails.title;
  } catch (error) {
    console.error('Error fetching app details from Google Play:', error);
    return null;
  }
};

// Scrape reviews from Google Play Store.
export const scrapeGooglePlayReviews = async (url) => {
  const appId = extractGooglePlayAppId(url); // Use helper function from utils/extractors.js
  if (!appId) {
    console.error('Error: Invalid Google Play Store URL');
    throw new Error('Invalid Google Play Store URL');
  }

  try {
    console.log('Fetching Google Play reviews for App ID:', appId);
    const reviews = await gplay.reviews({
      appId: appId,
      lang: 'en',
      country: 'in',
      sort: gplay.sort.NEWEST,
    });

    // Print reviews
    console.log(`Fetched ${reviews.data.length} reviews from Google Play Store`);
    console.log('Google Play Reviews:', reviews.data);

    return reviews.data.slice(0, 50); // Return top 50 reviews
  } catch (error) {
    console.error('Error fetching Google Play Store reviews:', error);
    return [];
  }
};

// Scrape reviews from Apple App Store.
export const scrapeAppleStoreReviews = async (url) => {
  const appId = extractAppleAppId(url);
  if (!appId) {
    console.error('Error: Invalid Apple App Store URL');
    throw new Error('Invalid Apple App Store URL');
  }

  const apiUrl = `https://itunes.apple.com/in/rss/customerreviews/page=1/id=${appId}/sortBy=mostRecent/json`;
  try {
    console.log('Fetching Apple App Store reviews for App ID:', appId);
    const response = await axios.get(apiUrl);

    console.log('Apple API response:', JSON.stringify(response.data, null, 2));

    // Check if the `entry` field exists
    if (!response.data.feed.entry) {
      console.warn('No reviews found in Apple API response.');
      return [];
    }

    const reviews = response.data.feed.entry.map((entry) => ({
      author: entry.author.name.label,
      title: entry.title.label,
      review: entry.content.label,
      rating: entry['im:rating'].label,
    }));

    // Print reviews
    console.log(`Fetched ${reviews.length} reviews from Apple App Store`);
    console.log('Apple App Store Reviews:', reviews);

    return reviews.slice(0, 50); // Limit to top 50 reviews
  } catch (error) {
    console.error('Error fetching Apple Store reviews:', error);
    return [];
  }
};

// Generate USP phrases using Gemini API.
export const generateUSPhrases = async (appName, reviews) => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const prompt = `What can be the 20 most efficient USP marketing headlines for ads for ${appName}? Focus only on providing the phrases category and phrases, related to the brand's main USP. Ensure there are no extra lines, tips, notes, or commentary—just the 20 headlines with its respective categories. Here's the context from the reviews:\n\n${reviews}`;

  try {
    console.log('Sending prompt to Gemini API to generate USP phrases');
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const phrases = response.data.candidates[0].content.parts[0].text
      .trim()
      .split('\n')
      .filter((phrase) => phrase.trim() !== '');

    console.log('Generated USP phrases:', phrases);
    return phrases;
  } catch (error) {
    console.error('Error generating USP phrases:', error);
    return [];
  }
};
