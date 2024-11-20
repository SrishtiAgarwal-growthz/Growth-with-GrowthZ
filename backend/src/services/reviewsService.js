import { extractGooglePlayAppId, extractAppleAppId, combineReviews } from '../utils/extractors.js';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import gplay from 'google-play-scraper';
import axios from 'axios';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scrape reviews from Google Play Store
export const scrapeGooglePlayReviews = async (url) => {
  const appId = extractGooglePlayAppId(url); // Extract app ID from URL
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

    console.log(`Fetched ${reviews.data.length} reviews from Google Play Store`);
    // console.log('Google Play Reviews:', reviews.data);
    return reviews.data.slice(0, 150); // Return top 150 reviews
  } catch (error) {
    console.error('Error fetching Google Play Store reviews:', error.message);
    return [];
  }
};

// Scrape reviews from Apple App Store
export const scrapeAppleStoreReviews = async (appId, country = 'in', appName) => {
  const scriptPath = path.join(__dirname, './scrape_apple_reviews.py'); // Ensure the path is correct
  console.log('Script path:', scriptPath); // Verify the Python script path
  console.log('Calling Python script with args:', appId, country, appName); // Log the parameters passed to the Python script

  return new Promise((resolve, reject) => {
    const process = spawn('python', [scriptPath, appId, country, appName]);

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        try {
          const parsedData = JSON.parse(output); // Parse Python output
          resolve(Array.isArray(parsedData) ? parsedData : []);
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError.message);
          resolve([]); // Return an empty array if parsing fails
        }
      } else {
        console.error('Python script failed with code:', code, 'Error:', error.trim());
        resolve([]); // Return an empty array if the script fails
      }
    });
  });
};

// Generate USP phrases using Gemini API
export const generateUSPhrases = async (appName, reviews) => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
    console.error('Error generating USP phrases:', error.message);
    return [];
  }
};

export const getAppNameFromGooglePlay = async (url) => {
  const match = url.match(/id=([a-zA-Z0-9._]+)/); // Extract app ID from URL
  if (!match) {
    console.error('Invalid Google Play URL');
    throw new Error('Invalid Google Play URL');
  }

  const appId = match[1];
  try {
    const appDetails = await gplay.app({ appId });
    console.log('App Name:', appDetails.title);
    return appDetails.title;
  } catch (error) {
    console.error('Error fetching app details from Google Play:', error.message);
    throw new Error('Failed to fetch app name from Google Play');
  }
};

// Handle USP Generation
export const handleUSPGeneration = async (google_play, apple_app) => {
  try {
    // Fetch Google Play reviews
    const googleReviews = await scrapeGooglePlayReviews(google_play);

    // Extract Apple app details
    const appleAppId = extractAppleAppId(apple_app); // Extract Apple App ID
    const appName = await getAppNameFromGooglePlay(google_play); // Ensure appName is awaited properly

    let appleReviews = [];
    if (appleAppId) {
      console.log(`Fetching Apple reviews for App ID: ${appleAppId} and App Name: ${appName}`);
      appleReviews = await scrapeAppleStoreReviews(appleAppId, 'in', appName); // Pass appName correctly
    }

    // Log fetched Apple reviews for debugging
    console.log("Fetched Apple Reviews:", appleReviews);

    // Combine reviews
    const combinedReviews = combineReviews(googleReviews, appleReviews);

    // Generate USP phrases
    return await generateUSPhrases(appName, combinedReviews);
  } catch (error) {
    console.error('Error handling USP generation:', error.message);
    throw new Error(error.message);
  }
};
