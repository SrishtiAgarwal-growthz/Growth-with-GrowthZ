import {
  fetchAppNameFromGooglePlay,
  scrapeGooglePlayReviews,
  scrapeAppleAppStoreReviews,
  extractGooglePlayDescription,
  extractAppStoreDescription,
  generateUSPhrases,
  fetchUserAdCopies,
  saveGeneratedPhrasesForUser,
} from "../services/reviewsService.js";

import { fetchOrCreateApp } from "../services/appService.js";
import { scrapeWebsiteContent } from "../services/websiteScrapeService.js";
import { generatePhrasesFromWebsite } from "../services/reviewsService.js";
import { saveTask } from "../services/taskService.js";
import { connectToMongo } from "../config/db.js";
import { extractGooglePlayAppId } from "../utils/extractors.js";
import { extractMeaningfulWords } from "../utils/word_extractor.js";

/**
 * POST /api/reviews/generate-phrases
 * Main route to handle the flow:
 *  - Check if app exists, if not => scrape & remove-bg once.
 *  - Then generate phrases for (user, app).
 *  - Store them in AdCopies so user can see them on subsequent logins.
 */
export const generateUSPhrasesHandler = async (req, res) => {
  console.log("[generateUSPhrasesHandler] Initial Request Body:", req.body);

  try {
    const { google_play, apple_app, website_link, appId, userId } = req.body;

    if (!userId) {
      console.error("[generateUSPhrasesHandler] Missing userId in request body.");
      return res.status(400).json({ message: "User ID is required." });
    }

    // Attempt to resolve appId
    let finalAppId = appId || null;

    if (!google_play && !apple_app && !website_link && !finalAppId) {
      console.warn("[generateUSPhrasesHandler] No store link or website link or appId provided.");
      return res.status(400).json({
        message: "Please provide either Google Play/Apple link, website link, or existing appId.",
      });
    }

    // If no appId given, call fetchOrCreateApp
    if (!finalAppId) {
      console.log("[generateUSPhrasesHandler] No appId => fetchOrCreateApp...");
      const appDoc = await fetchOrCreateApp(google_play, apple_app, website_link);
      finalAppId = appDoc && appDoc._id ? appDoc._id.toString() : null;
      console.log("[generateUSPhrasesHandler] finalAppId =>", finalAppId);
    }

    if (!finalAppId) {
      throw new Error("Unable to resolve or create an appId.");
    }

    // 2) Check if user already has AdCopies for (userId, finalAppId)
    const existingAdCopy = await fetchUserAdCopies(userId, finalAppId);
    if (existingAdCopy) {
      console.log("[generateUSPhrasesHandler] User already has AdCopies. Returning existing phrases...");
      return res.status(200).json({
        status: "already_exists",
        appId: finalAppId,
        phrases: existingAdCopy,
        message: "Phrases already exist for this user & app.",
      });
    }

    // 3) Otherwise, create/fetch the Task for (userId, finalAppId) 
    console.log("[generateUSPhrasesHandler] Creating or fetching Task doc...");
    const task = await saveTask(userId, finalAppId);
    console.log("[generateUSPhrasesHandler] Task doc found/created =>", task);
    const taskId = task._id.toString();

    console.log("[generateUSPhrasesHandler] finalAppId to use:", finalAppId);

    // Now do your usual text-scraping or website-scraping logic
    // so we can generate new phrases.

    let appName = "";
    let combinedReviews = [];
    let combinedDescription = [];
    let combinedSummary = [];
    let keywords = [];

    if (website_link) {
      // (A) If user gave website link
      console.log("[generateUSPhrasesHandler] Scraping website content:", website_link);
      const websiteContent = await scrapeWebsiteContent(website_link);

      if (!websiteContent || !websiteContent.metadata) {
        console.error("[generateUSPhrasesHandler] Could not scrape website content.");
        throw new Error("Unable to scrape content from the website.");
      }

      appName = websiteContent.metadata.title || "Untitled Website";

      combinedReviews = [
        websiteContent.metadata.metaDescription || "",
        websiteContent.metadata.keywords || "",
        ...websiteContent.headings.map((h) => h.text),
        ...websiteContent.tables.flat().join(" "),
      ];

      console.log("[generateUSPhrasesHandler] Website content => combinedReviews length:", combinedReviews.length);
    } else {
      // (B) If user gave Google/Apple store links
      if (!google_play) {
        throw new Error("Google Play store link is required if no website link is provided.");
      }

      const googleAppId = extractGooglePlayAppId(google_play);
      if (!googleAppId) {
        throw new Error("Invalid Google Play Store URL or unable to extract ID.");
      }

      console.log(`[generateUSPhrasesHandler] Google Play ID => ${googleAppId}`);
      appName = await fetchAppNameFromGooglePlay(googleAppId);
      console.log("[generateUSPhrasesHandler] appName from GP =>", appName);

      console.log("[generateUSPhrasesHandler] Scraping Google Play reviews...");
      const googlePlayReviews = await scrapeGooglePlayReviews(google_play);
      console.log(`[generateUSPhrasesHandler] Got ${googlePlayReviews.length} googlePlayReviews`);

      let appleStoreReviews = [];
      if (apple_app) {
        console.log("[generateUSPhrasesHandler] Scraping Apple App Store reviews...");
        appleStoreReviews = await scrapeAppleAppStoreReviews(apple_app);
        console.log(`[generateUSPhrasesHandler] Got ${appleStoreReviews.length} appleStoreReviews`);
      }

      combinedReviews = [...googlePlayReviews, ...appleStoreReviews];
      console.log(`[generateUSPhrasesHandler] Combined => ${combinedReviews.length} reviews total`);

      // Also fetch store descriptions if desired
      const googlePlayDescription = await extractGooglePlayDescription(google_play);
      let appleStoreDescription = [];
      if (apple_app) {
        appleStoreDescription = await extractAppStoreDescription(apple_app);
      }
      combinedDescription = [...googlePlayDescription, ...appleStoreDescription];
      combinedSummary = [...combinedReviews, ...combinedDescription];
      console.log("[generateUSPhrasesHandler] combinedSummary =>", combinedSummary.length, "items");
    }

    // Extract meaningful keywords
    console.log("[generateUSPhrasesHandler] Extracting meaningful words from summary...");
    keywords = extractMeaningfulWords([...combinedSummary]);
    console.log("[generateUSPhrasesHandler] Keywords => count:", keywords.length);

    // Generate USP phrases with your LLM
    console.log("[generateUSPhrasesHandler] Calling generateUSPhrases...");
    const uspPhrases = await generateUSPhrases(appName, keywords);
    console.log("[generateUSPhrasesHandler] uspPhrases =>", uspPhrases.length);

    // Save them in AdCopies with "pending" status for this user + task
    console.log("[generateUSPhrasesHandler] Saving to AdCopies => appId:", finalAppId, "taskId:", taskId);
    // 5) Save them in AdCopies (with userId)
    const savedDoc = await saveGeneratedPhrasesForUser(userId, finalAppId, taskId, uspPhrases);
    console.log("[generateUSPhrasesHandler] savedDoc =>", savedDoc._id);

    return res.status(200).json({
      status: "success",
      appId: finalAppId,
      taskId,
      phrases: savedDoc,
      appName,
      totalReviews: combinedReviews.length || 0,
      message: "Phrases newly generated for this user & app",
    });
  } catch (error) {
    console.error("[generateUSPhrasesHandler] Error:", error);
    return res.status(500).json({
      message: "Error generating USP phrases.",
      error: error.message,
    });
  }
};

export const generateWebsiteAdCopies = async (req, res) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  console.log("[generateWebsiteAdCopies] Initial Request Body:", req.body);

  try {
    const { website_link, userId } = req.body;

    // Validate required parameters
    if (!website_link || !userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Both website_link and userId are required'
      });
    }

    console.log(`[generateWebsiteAdCopies] Processing website: ${website_link}`);

    // Check for existing ad copies
    const existingCopies = await adCopiesCollection.findOne({
      website: website_link,
      userId: userId,
    });

    if (existingCopies) {
      console.log(`[generateWebsiteAdCopies] Found existing copies for website: ${website_link}`);
      return res.status(200).json({
        status: 'already_exists',
        adCopies: existingCopies,
        message: "Phrases already exist for this user & website.",
      });
    }

    // 3) Otherwise, create/fetch the Task for (userId, finalAppId) 
    console.log("[generateWebsiteAdCopies] Creating or fetching Task doc...");
    const task = await saveTask(userId, website_link);
    console.log("[generateWebsiteAdCopies] Task doc found/created =>", task);
    const taskId = task._id.toString();

    // Scrape website content
    console.log(`[generateWebsiteAdCopies] Scraping content from: ${website_link}`);
    const websiteContent = await scrapeWebsiteContent(website_link);

    const combinedReviews = [
      websiteContent.metadata.metaDescription || "",
      websiteContent.metadata.keywords || "",
      ...websiteContent.headings.map((h) => h.text),
      ...websiteContent.tables.flat().join(" "),
    ];

    // Generate phrases from website content
    const generatedPhrases = await generatePhrasesFromWebsite(combinedReviews);

    // Prepare phrases with metadata
    const phrasesWithMetadata = generatedPhrases.map(phrase => ({
      text: phrase,
      status: 'pending',
    }));

    const nowUTC = new Date(); // Get current UTC time
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const createdAtIST = new Date(nowUTC.getTime() + ISTOffset);
    
    // Save to database
    const savedCopies = await adCopiesCollection.insertOne({
      userId: userId,
      taskId: taskId,
      source: 'website',
      website: website_link,
      phrases: phrasesWithMetadata,
      createdAt: createdAtIST,
    });

    console.log(`[generateWebsiteAdCopies] Successfully generated ad copies for: ${website_link}`);

    res.status(200).json({
      status: 'success',
      adCopies: {
        _id: savedCopies.insertedId,
        website: website_link,
        phrases: phrasesWithMetadata
      }
    });

  } catch (error) {
    console.error('[generateWebsiteAdCopies] Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate ad copies'
    });
  } finally {
    await client.close();
  }
};