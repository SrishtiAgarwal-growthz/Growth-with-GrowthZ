import axios from "axios";
import path from "path";
import { spawn } from "child_process";
import gplay from "google-play-scraper";
import { fileURLToPath } from "url";
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
      num: 500, // Fetch up to 500 reviews
    });

    // Filter 5-star reviews and extract only the 'reviewText' field
    const fiveStarReviews = reviews.data
      .filter((review) => review.score === 5) // Only 5-star reviews
      .map((review) => review.text || ""); // Extract only 'reviewText' field, default to empty string if missing

    console.log(`[scrapeGooglePlayReviews] Fetched ${fiveStarReviews.length} 5-star reviews for App ID: ${appId}`);
    return fiveStarReviews.slice(0, 150); // Limit to the first 150 reviews
  } catch (error) {
    console.error("[scrapeGooglePlayReviews] Error fetching reviews:", error.message);
    return [];
  }
};

// Scrape reviews from Apple App Store
export const scrapeAppleStoreReviews = async (appId, country = "in", appName = "") => {
  const scriptPath = path.resolve(__dirname, "./scrape_apple_reviews.py");
  console.log(`[scrapeAppleStoreReviews] Script Path: ${scriptPath}`);
  console.log(`[scrapeAppleStoreReviews] App ID: ${appId}, Country: ${country}, App Name: ${appName}`);

  return new Promise((resolve, reject) => {
    const process = spawn("python", [scriptPath, appId, country, appName]);

    let output = "";
    let error = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`[scrapeAppleStoreReviews] Python Script Output: ${data.toString()}`);
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const parsedData = output ? JSON.parse(output) : { reviews: [] };
          if (parsedData.reviews && Array.isArray(parsedData.reviews)) {
            console.log(`[scrapeAppleStoreReviews] Parsed ${parsedData.reviews.length} 5-star reviews`);
            resolve(parsedData.reviews);
          } else {
            console.error("[scrapeAppleStoreReviews] No reviews found in parsed data.");
            resolve([]);
          }
        } catch (parseError) {
          console.error("[scrapeAppleStoreReviews] Error parsing Python output:", parseError.message);
          console.error("[scrapeAppleStoreReviews] Raw Output:", output);
          resolve([]); // Return an empty array on parsing error
        }
      } else {
        console.error(`[scrapeAppleStoreReviews] Python script failed with code: ${code}, Error: ${error.trim()}`);
        resolve([]); // Return an empty array on script failure
      }
    });
  });
};

// Generate USP phrases using Gemini API
export const generateUSPhrases = async (appName, reviews) => {
  console.log(`[generateUSPhrases] Generating USP phrases for App: ${appName}`);
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `What can be the 20 most efficient USP marketing headlines for ads for ${appName}? Focus only on providing the phrases category and phrases, related to the brand's main USP. Ensure there are no extra lines, tips, notes, or commentary—just the 20 headlines with its respective categories. Here's the context from the reviews:\n\n${reviews}`;

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
