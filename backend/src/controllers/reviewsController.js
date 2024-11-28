import {
  generateUSPhrases,
  scrapeGooglePlayReviews,
  scrapeAppleAppStoreReviews,
  fetchAppNameFromGooglePlay,
} from "../services/reviewsService.js";
import { scrapeWebsiteContent } from "../services/websiteScrapeService.js";
import { extractGooglePlayAppId } from "../utils/extractors.js";
import { extractMeaningfulWords } from "../utils/word_extractor.js";

export const generateUSPhrasesHandler = async (req, res) => {
  console.log("[generateUSPhrasesHandler] Initial Request Body:", req.body);

  if (!req.body) {
    console.error("[generateUSPhrasesHandler] Error: req.body is undefined");
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { google_play, apple_app, website_link } = req.body;

  // Ensure at least one input is provided
  if (!google_play && !apple_app && !website_link) {
    return res.status(400).json({
      message: "Please provide either Google Play and/or Apple App Store link or a Website link.",
    });
  }

  try {
    let appName = "";
    let contentSource = "";
    let combinedReviews = [];
    let keywords = [];

    if (website_link) {
      // Handle Website Link
      console.log(`[generateUSPhrasesHandler] Processing Website Link: ${website_link}`);
      const websiteContent = await scrapeWebsiteContent(website_link);

      if (!websiteContent || !websiteContent.metadata) {
        throw new Error("Unable to scrape content from the website.");
      }

      appName = websiteContent.metadata.title || "Untitled Website";
      contentSource = "website";

      // Combine text from metadata, headings, and forms
      combinedReviews = [
        websiteContent.metadata.metaDescription || "",
        websiteContent.metadata.keywords || "",
        ...websiteContent.headings.map((heading) => heading.text),
        ...websiteContent.tables.flat().join(" "),
      ];

      console.log(`[generateUSPhrasesHandler] Scraped Content: ${combinedReviews.length} elements`);
    } else {
      // Handle Google Play and Apple App Store Links
      if (!google_play) {
        throw new Error("Google Play Store URL is mandatory if no Website Link is provided.");
      }

      const googleAppId = extractGooglePlayAppId(google_play);
      if (!googleAppId) throw new Error("[generateUSPhrasesHandler] Invalid Google Play App ID");
      console.log(`[generateUSPhrasesHandler] Google App ID: ${googleAppId}`);

      appName = await fetchAppNameFromGooglePlay(googleAppId);
      if (!appName) throw new Error("Unable to extract app name from Google Play URL.");
      contentSource = "google_play";

      const googlePlayReviews = await scrapeGooglePlayReviews(google_play);
      console.log(`[generateUSPhrasesHandler] Total Google Reviews: ${googlePlayReviews.length}`);

      let appleStoreReviews = [];
      if (apple_app) {
        console.log(`[generateUSPhrasesHandler] Processing Apple App URL: ${apple_app}`);
        appleStoreReviews = await scrapeAppleAppStoreReviews(apple_app);
        console.log(`[generateUSPhrasesHandler] Total Apple Reviews: ${appleStoreReviews.length}`);
      } else {
        console.warn("[generateUSPhrasesHandler] Apple App Store URL not provided. Skipping.");
      }

      combinedReviews = googlePlayReviews.concat(appleStoreReviews);
      console.log(`[generateUSPhrasesHandler] Total Combined Reviews: ${combinedReviews.length}`);
    }

    // Extract meaningful words (keywords) from the combined content
    keywords = extractMeaningfulWords(combinedReviews);
    console.log(`[generateUSPhrasesHandler] Extracted Keywords: ${keywords}`);

    // Generate USP phrases
    const uspPhrases = await generateUSPhrases(appName, keywords);
    console.log(`[generateUSPhrasesHandler] Generated USP Phrases: ${uspPhrases}`);

    res.json({
      status: "success",
      contentSource,
      appName,
      totalReviews: combinedReviews.length,
      keywords,
      uspPhrases,
    });
  } catch (error) {
    console.error("[generateUSPhrasesHandler] Error:", error.message);
    res.status(500).json({ message: "Error generating USP phrases", error: error.message });
  }
};
