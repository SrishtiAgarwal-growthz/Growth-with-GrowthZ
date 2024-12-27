// src/services/reviewsService.js

import axios from "axios";
import gplay from "google-play-scraper";
import store from "app-store-scraper";
import path from "path";
import { fileURLToPath } from "url";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId, extractAppleAppId } from "../utils/extractors.js";

// so we can get __dirname if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------------------
// 1) Original scraping & LLM-based phrase generation code
// ----------------------------------------------------------------

// 1.1) Google Play app name
export const fetchAppNameFromGooglePlay = async (appId) => {
  console.log(`[fetchAppNameFromGooglePlay] appId=${appId}`);
  if (!appId) throw new Error("Missing appId for fetchAppNameFromGooglePlay");

  try {
    const appDetails = await gplay.app({ appId });
    const appName = appDetails.title;
    console.log(`[fetchAppNameFromGooglePlay] extracted appName => ${appName}`);
    return appName;
  } catch (error) {
    console.error("[fetchAppNameFromGooglePlay] error =>", error.message);
    throw new Error("Unable to fetch app name from Google Play");
  }
};

// 1.2) Scrape Google Play reviews
export const scrapeGooglePlayReviews = async (url) => {
  console.log(`[scrapeGooglePlayReviews] url=${url}`);
  const appId = extractGooglePlayAppId(url);
  if (!appId) throw new Error("Invalid Google Play URL or missing appId");
  console.log(`[scrapeGooglePlayReviews] appId => ${appId}`);

  try {
    const reviews = await gplay.reviews({
      appId,
      lang: "en",
      country: "in",
      sort: gplay.sort.RATING,
      num: 5000,
    });
    const fiveStarReviews = reviews.data.filter(r => r.score === 5).map(r => r.text || "");
    console.log(`[scrapeGooglePlayReviews] => ${fiveStarReviews.length} 5-star reviews`);
    return fiveStarReviews.slice(0, 5000);
  } catch (error) {
    console.error("[scrapeGooglePlayReviews] error =>", error.message);
    return [];
  }
};

// 1.3) Scrape Apple App Store reviews
export const scrapeAppleAppStoreReviews = async (input) => {
  let appId = null;
  if (input.includes("apple.com")) {
    console.log(`[scrapeAppleAppStoreReviews] input => apple.com`);
    const match = input.match(/id(\d+)/);
    if (match) {
      appId = match[1];
    }
  } else {
    appId = input;
  }

  if (!appId) {
    console.error("[scrapeAppleAppStoreReviews] invalid or missing apple ID");
    throw new Error("Invalid Apple App Store URL or App ID");
  }

  try {
    const reviews = await store.reviews({
      id: appId,
      country: "in",
      page: 1,
      sort: store.sort.RECENT,
    });
    const fiveStarReviews = reviews
      .filter(r => r.score === 5)
      .map(r => r.text || "");
    console.log(`[scrapeAppleAppStoreReviews] => ${fiveStarReviews.length} 5-star reviews`);
    return fiveStarReviews.slice(0, 5000);
  } catch (error) {
    console.error("[scrapeAppleAppStoreReviews] error =>", error.message);
    return [];
  }
};

// 1.4) Extract store descriptions
export const extractGooglePlayDescription = async (url) => {
  console.log(`[extractGooglePlayDescription] url => ${url}`);
  const appId = extractGooglePlayAppId(url);
  if (!appId) throw new Error("Invalid Google Play URL or missing appId");
  try {
    const data = await gplay.app({ appId });
    return [data.description, data.descriptionHTML, data.summary];
  } catch (error) {
    console.error("[extractGooglePlayDescription] error =>", error.message);
    return [];
  }
};

export const extractAppStoreDescription = async (url) => {
  let appId = null;
  if (url.includes("apple.com")) {
    const match = url.match(/id(\d+)/);
    appId = match ? match[1] : null;
  } else {
    appId = url; // fallback
  }
  if (!appId) throw new Error("Invalid Apple App Store URL or App ID");
  try {
    const data = await store.app({ id: appId });
    return [data.description];
  } catch (error) {
    console.error("[extractAppStoreDescription] error =>", error.message);
    return [];
  }
};

// 1.5) Generate USP phrases with Gemini or your LLM
export const generateUSPhrases = async (appName, keywords) => {
  console.log("[generateUSPhrases] appName =>", appName);
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `
Generate 20 unique selling propositions (USPs) for the following app. 
Make them concise and user-centric, highlighting the app's benefits/features.

- App Name: ${appName}
- Keywords: ${keywords.slice(0, 1000).join(", ")} 

Write them in plain English.
`;

  try {
    console.log("[generateUSPhrases] calling Gemini with prompt...");
    const response = await axios.post(apiUrl,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
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
    const rawText = response.data.candidates[0].content.parts[0].text.trim();
    const lines = rawText.split("\n").filter(Boolean);
    console.log(`[generateUSPhrases] got ${lines.length} lines from Gemini`);
    return lines;
  } catch (error) {
    console.error("[generateUSPhrases] Error =>", error.message);
    throw new Error("Failed to generate USP phrases via Gemini");
  }
};

// 1.6) Save phrases in AdCopies collection for this user
export const saveGeneratedPhrases = async (appId, taskId, phrases) => {
  console.log("[saveGeneratedPhrases] appId =>", appId, "taskId =>", taskId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    const doc = {
      appId,
      taskId,
      phrases: phrases.map(text => ({
        text,
        status: "pending",
      })),
      createdAt: new Date(),
    };

    const result = await adCopiesCollection.insertOne(doc);
    console.log("[saveGeneratedPhrases] Inserted =>", result.insertedId);
    return { ...doc, _id: result.insertedId };
  } finally {
    await client.close();
  }
};

/**
 * fetchUserAdCopies:
 *   Checks if there's an AdCopies doc for a given user+app.
 *   If you store userId in AdCopies, we can find it. 
 *   (Below uses the 'AdCopies' collection with "userId" included.)
 */
export const fetchUserAdCopies = async (userId, appId) => {
  console.log("[fetchUserAdCopies] userId:", userId, "appId:", appId);
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    const doc = await adCopiesCollection.findOne({ userId, appId });
    if (doc) {
      console.log("[fetchUserAdCopies] Found existing AdCopies doc:", doc._id);
    } else {
      console.log("[fetchUserAdCopies] No AdCopies found for this user+app.");
    }
    return doc;
  } finally {
    await client.close();
  }
};

/**
 * saveGeneratedPhrasesForUser:
 *   If you want to store userId in AdCopies, so each user can have their own phrases,
 *   this is a variant of your 'saveGeneratedPhrases' but also includes userId.
 */
export const saveGeneratedPhrasesForUser = async (userId, appId, taskId, phrases) => {
  console.log("[saveGeneratedPhrasesForUser] userId:", userId, "appId:", appId, "taskId:", taskId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    const doc = {
      userId,
      appId,
      taskId,
      phrases: phrases.map((text) => ({
        text,
        status: "pending",
      })),
      createdAt: new Date(),
    };

    const result = await adCopiesCollection.insertOne(doc);
    console.log("[saveGeneratedPhrasesForUser] Inserted =>", result.insertedId);
    return { ...doc, _id: result.insertedId };
  } finally {
    await client.close();
  }
};