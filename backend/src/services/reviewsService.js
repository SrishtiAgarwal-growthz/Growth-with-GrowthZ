import axios from "axios";
import gplay from "google-play-scraper";
import store from "app-store-scraper";
import path from "path";
import { fileURLToPath } from "url";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId } from "../utils/extractors.js";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fetch app name (title) from Google Play Store
export const fetchAppNameFromGooglePlay = async (appId) => {
  console.log(`[fetchAppNameFromGooglePlay] Fetching app name for App ID: ${appId}`);
  if (!appId) {
    throw new Error("[fetchAppNameFromGooglePlay] App ID is invalid or missing.");
  }

  try {
    const appDetails = await gplay.app({ appId });
    const appName = appDetails.title;
    console.log(`[fetchAppNameFromGooglePlay] App Name fetched: ${appName}`);
    return appName;
  } catch (error) {
    console.error(`[fetchAppNameFromGooglePlay] Failed to fetch app name for App ID: ${appId}`, error.message);
    throw new Error(`Unable to fetch app name for App ID: ${appId}`);
  }
};

// Scrape reviews from Google Play Store
export const scrapeGooglePlayReviews = async (url) => {
  console.log(`[scrapeGooglePlayReviews] Extracting Google Play App ID from URL: ${url}`);
  const appId = extractGooglePlayAppId(url);
  if (!appId) {
    console.error("[scrapeGooglePlayReviews] Error: Invalid Google Play Store URL");
    throw new Error("Invalid Google Play Store URL");
  }
  console.log(`[scrapeGooglePlayReviews] Extracted App ID: ${appId}`);

  try {
    console.log(`[scrapeGooglePlayReviews] Fetching reviews for App ID: ${appId}`);
    const reviews = await gplay.reviews({
      appId: appId,
      lang: "en",
      country: "in",
      sort: gplay.sort.RATING,
      num: 5000, // Fetch up to 500 reviews
    });

    // Filter 5-star reviews and extract only the 'reviewText' field
    const fiveStarReviews = reviews.data
      .filter((review) => review.score === 5) // Only 5-star reviews
      .map((review) => review.text || ""); // Extract only 'reviewText' field, default to empty string if missing

    console.log(`[scrapeGooglePlayReviews] Fetched ${fiveStarReviews.length} 5-star reviews for App ID: ${appId}`);
    return fiveStarReviews.slice(0, 5000); // Limit to the first 150 reviews
  } catch (error) {
    console.error("[scrapeGooglePlayReviews] Error fetching reviews:", error.message);
    return [];
  }
};

// Scrape reviews from Apple App Store
export const scrapeAppleAppStoreReviews = async (input) => {
  let appId;

  // If input is a URL, extract the App ID
  if (input.includes("apple.com")) {
    console.log(`[scrapeAppleAppStoreReviews] Extracting Apple App ID from URL: ${input}`);
    const match = input.match(/id(\d+)/); // Extract ID from URL pattern like ".../id123456789"
    appId = match ? match[1] : null;
  } else {
    // If input is not a URL, assume it's an App ID
    appId = input;
  }

  if (!appId) {
    console.error("[scrapeAppleAppStoreReviews] Error: Invalid Apple App Store URL or App ID");
    throw new Error("Invalid Apple App Store URL or App ID");
  }
  console.log(`[scrapeAppleAppStoreReviews] Extracted App ID: ${appId}`);

  try {
    console.log(`[scrapeAppleAppStoreReviews] Fetching reviews for App ID: ${appId}`);
    const reviews = await store.reviews({
      id: appId,
      country: "in", // Set to India; adjust if needed
      page: 1, // Start with the first page of reviews
      sort: store.sort.RECENT, // Sort by most recent reviews
    });

    // Filter 5-star reviews and extract only the 'text' field
    const fiveStarReviews = reviews
      .filter((review) => review.score === 5) // Only 5-star reviews
      .map((review) => review.text || ""); // Extract only 'text' field, default to empty string if missing

    console.log(`[scrapeAppleAppStoreReviews] Fetched ${fiveStarReviews.length} 5-star reviews for App ID: ${appId}`);
    return fiveStarReviews.slice(0, 5000); // Limit to the first 150 reviews
  } catch (error) {
    console.error("[scrapeAppleAppStoreReviews] Error fetching reviews:", error.message);
    return [];
  }
};

export const extractGooglePlayDescription = async (input) => {
  console.log(`[extractGooglePlayDescription] Extracting Google Play App ID from URL: ${input}`);
  const appId = extractGooglePlayAppId(input);
  if (!appId) {
    console.error("[extractGooglePlayDescription] Error: Invalid Google Play Store URL");
    throw new Error("Invalid Google Play Store URL");
  }
  console.log(`[extractGooglePlayDescriptions] Extracted App ID: ${appId}`);

  try {
    console.log(`[extractGooglePlayDescription] Fetching description for App ID: ${appId}`);
    const googlePlayData = await gplay.app({ appId });
    const appDescription = [
      googlePlayData.description,
      googlePlayData.descriptionHTML,
      googlePlayData.summary,
    ]
    console.log('[extractGooglePlayDescription] Fetched description');
    return appDescription;
  }
  catch (error) {
    console.error("[extractGooglePlayDescription] Error fetching description:", error.message);
    return [];
  }
}

export const extractAppStoreDescription = async (input) => {
  let appId;

  // If input is a URL, extract the App ID
  if (input.includes("apple.com")) {
    console.log(`[extractAppStoreDescription] Extracting Apple App ID from URL: ${input}`);
    const match = input.match(/id(\d+)/); // Extract ID from URL pattern like ".../id123456789"
    appId = match ? match[1] : null;
  } else {
    // If input is not a URL, assume it's an App ID
    appId = input;
  }

  if (!appId) {
    console.error("[extractAppStoreDescription] Error: Invalid Apple App Store URL or App ID");
    throw new Error("Invalid Apple App Store URL or App ID");
  }
  console.log(`[extractAppStoreDescription] Extracted App ID: ${appId}`);

  try {
    console.log(`[extractAppStoreDescription] Fetching description for App ID: ${appId}`);
    const appleData = await store.app({ id: appId });
    const appDescription = appleData.description;
    console.log('[extractAppStoreDescription] Fetched description.');
    return appDescription;
  }
  catch (error) {
    console.error("[extractAppStoreDescription] Error fetching description:", error.message);
    return [];
  }
}

// Generate USP phrases using Gemini API
export const generateUSPhrases = async (appName, keywords) => {
  console.log(`[generateUSPhrases] Generating USP phrases for App: ${appName}`);
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
    Generate 20 unique selling propositions (USPs) for the following app. 
    Make the USPs concise, engaging, and user-centric. Highlight the app's benefits and unique features.
    
    - App Name: ${appName}
    - Keywords: ${keywords.slice(0, 5000).join(", ")} 
    
    Focus on making these USPs persuasive and tailored to potential users.
  `;

  try {
    console.log("[generateUSPhrases] Sending request to Gemini API...");
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            role: "user",
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
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const phrases = response.data.candidates[0].content.parts[0].text
      .trim()
      .split("\n")
      .filter((phrase) => phrase.trim() !== "");
    console.log("[generateUSPhrases] Generated USP Phrases:", phrases);
    return phrases;
  } catch (error) {
    console.error("[generateUSPhrases] Error generating USP phrases:", error.message);
    throw new Error("Failed to generate USP phrases");
  }
};

export const saveGeneratedPhrases = async (appId, taskId, phrases) => {
  console.log("[saveGeneratedPhrases] Saving generated phrases for app:", appId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const phrasesCollection = db.collection("AdCopies");

  const document = {
    appId: appId,
    taskId: taskId,
    phrases: phrases.map((phrase) => ({
      text: phrase,
      status: "pending",
    })),
    createdAt: new Date(),
  };

  const result = await phrasesCollection.insertOne(document);
  console.log("[saveGeneratedPhrases] Phrases saved successfully:", result.insertedId);

  return { ...document, _id: result.insertedId };
};