import {
  fetchAppNameFromGooglePlay,
  scrapeGooglePlayReviews,
  scrapeAppleAppStoreReviews,
  extractGooglePlayDescription,
  extractAppStoreDescription,
  generateUSPhrases,
} from "../services/reviewsService.js";
import { scrapeWebsiteContent } from "../services/websiteScrapeService.js";
import { saveTask } from "../services/taskService.js";
import { saveGeneratedPhrases } from "../services/phraseService.js";
import { extractGooglePlayAppId } from "../utils/extractors.js";
import { extractMeaningfulWords } from "../utils/word_extractor.js";

export const generateUSPhrasesHandler = async (req, res) => {
  console.log("[generateUSPhrasesHandler] Initial Request Body:", req.body);

  try {
    const { google_play, apple_app, website_link, userId, appId } = req.body;

    // Ensure at least one input is provided
    if (!google_play && !apple_app && !website_link) {
      console.warn("[generateUSPhrasesHandler] Missing required input.");
      return res.status(400).json({
        message: "Please provide either Google Play and/or Apple App Store link or a Website link.",
      });
    }

    // Step 1: Create a new task
    console.log("[generateUSPhrasesHandler] Creating a new task...");
    const task = await saveTask(userId, appId);

    // Step 2: Fetch app details and generate phrases
    let appName = "";
    let combinedReviews = [];
    let combinedDescription = [];
    let combinedSummary = [];
    let keywords = [];

    if (website_link) {
      // Handle Website Link
      console.log("[generateUSPhrasesHandler] Scraping website content:", website_link);
      const websiteContent = await scrapeWebsiteContent(website_link);

      if (!websiteContent || !websiteContent.metadata) {
        console.error("[generateUSPhrasesHandler] Failed to scrape website content.");
        throw new Error("Unable to scrape content from the website.");
      }

      appName = websiteContent.metadata.title || "Untitled Website";

      combinedReviews = [
        websiteContent.metadata.metaDescription || "",
        websiteContent.metadata.keywords || "",
        ...websiteContent.headings.map((heading) => heading.text),
        ...websiteContent.tables.flat().join(" "),
      ];

      console.log("[generateUSPhrasesHandler] Scraped content length:", combinedReviews.length);
    } else {
      // Handle Google Play and Apple App Store Links
      if (!google_play) {
        throw new Error("Google Play Store URL is mandatory if no Website Link is provided.");
      }

      const googleAppId = extractGooglePlayAppId(google_play);
      if (!googleAppId) {
        console.error("[generateUSPhrasesHandler] Invalid Google Play App ID.");
        throw new Error("Invalid Google Play App ID.");
      }

      console.log("[generateUSPhrasesHandler] Fetching app name for Google App ID:", googleAppId);
      appName = await fetchAppNameFromGooglePlay(googleAppId);
      if (!appName) {
        throw new Error("Unable to extract app name from Google Play URL.");
      }

      console.log("[generateUSPhrasesHandler] Fetching Google Play reviews...");
      const googlePlayReviews = await scrapeGooglePlayReviews(google_play);
      console.log("[generateUSPhrasesHandler] Total Google Play reviews:", googlePlayReviews.length);

      let appleStoreReviews = [];
      if (apple_app) {
        console.log("[generateUSPhrasesHandler] Fetching Apple App Store reviews...");
        appleStoreReviews = await scrapeAppleAppStoreReviews(apple_app);
        console.log("[generateUSPhrasesHandler] Total Apple App Store reviews:", appleStoreReviews.length);
      }

      console.log("[generateUSPhrasesHandler] Combining reviews...");
      combinedReviews = [...googlePlayReviews, ...appleStoreReviews];
      console.log("[generateUSPhrasesHandler] Combined reviews length:", combinedReviews.length);

      console.log("[generateUSPhrasesHandler] Fetching Google Play description...");
      const googlePlayDescription = await extractGooglePlayDescription(google_play);
      console.log("[generateUSPhrasesHandler] Fetched Google Play description.");

      let appleStoreDescription;
      if (apple_app) {
        console.log("[generateUSPhrasesHandler] Fetching Apple App Store description...");
        appleStoreDescription = await extractAppStoreDescription(apple_app);
        console.log("[generateUSPhrasesHandler] Fetched Apple App Store description.");
      }

      console.log("[generateUSPhrasesHandler] Combining description...");
      combinedDescription = [...googlePlayDescription, ...appleStoreDescription];
      console.log("[generateUSPhrasesHandler] Combined descriptions.");

      console.log("[generateUSPhrasesHandler] Combining summary...");
      combinedSummary = [...combinedReviews, ...combinedDescription];
      console.log("[generateUSPhrasesHandler] Combined summary.");
    }

    // Extract meaningful keywords
    console.log("[generateUSPhrasesHandler] Extracting keywords...");
    keywords = extractMeaningfulWords(combinedSummary);
    console.log("[generateUSPhrasesHandler] Keywords extracted:", keywords);

    // Generate USP phrases
    console.log("[generateUSPhrasesHandler] Generating USP phrases...");
    const uspPhrases = await generateUSPhrases(appName, keywords);
    console.log("[generateUSPhrasesHandler] USP phrases generated:", uspPhrases);

    // Step 3: Save generated phrases to the database
    console.log("[generateUSPhrasesHandler] Saving phrases to database...");
    const savedPhrases = await saveGeneratedPhrases(appId, task._id, uspPhrases);
    console.log("[generateUSPhrasesHandler] Phrases saved successfully:", savedPhrases);

    res.status(200).json({
      status: "success",
      taskId: task._id,
      phrases: savedPhrases,
      appName,
      totalReviews: combinedReviews.length,
      // keywords,
      uspPhrases,
    });
  } catch (error) {
    console.error("[generateUSPhrasesHandler] Error:", error.message);
    res.status(500).json({
      message: "Error generating USP phrases.",
      error: error.message,
    });
  }
};
