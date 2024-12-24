import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";
import {
  removeBackground,
  uploadToS3,
  extractBackgroundColor,
  extractTextColor,
  fetchIconUrl,
  fetchWebsiteUrl,
  fetchFont,
  fetchCTAForCategory,
} from "../utils/imageProcessingSteps.js";
import { rgbToArray, areColorsSimilar, isColorCloserToWhite, getContrastingColor, getOptimalTextColor } from "../utils/colorUtils.js";
import { createAd } from "../utils/puppeteerAdGenerator.js";
import { adDimensionsConfig } from "../utils/adDimensions.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process app images: remove background, upload to S3, extract background color, and identify font.
 * @param {string} appId - The ID of the app whose images are to be processed.
 * @returns {Promise<Object>} - Returns an object containing updated image data, approved phrases, icon URL, and font details.
 */
export const processAppImages = async (appId, userId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  try {
    console.log(`[processAppImages] Processing images for app: ${appId}`);

    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app || !Array.isArray(app.images)) {
      throw new Error("[processAppImages] App not found or invalid image field.");
    }

    // Fetch icon URL
    const iconUrl = await fetchIconUrl(appId);
    console.log(`[processAppImages] Icon URL fetched: ${iconUrl}`);

    const iconBackgroundColor = await extractBackgroundColor(iconUrl);
    console.log(`[processAppImages] Extracting logo background color for: ${iconUrl}`);

    // Fetch website URL
    const websiteUrl = await fetchWebsiteUrl(appId);
    console.log(`[processAppImages] Website URL fetched: ${websiteUrl}`);

    // Fetch CTA
    const CTA = await fetchCTAForCategory(appId);
    console.log(`[processAppImages] CTA fetched: ${CTA}`);

    // Save font URL in the app's document
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          iconBackgroundColor: iconBackgroundColor,
          CTA: CTA,
        },
      }
    );

    console.log(`[processAppImages] Font URL saved in the app document for appId: ${appId}`);

    const updatedImages = [];

    for (const image of app.images) {
      if (!image.screenshot) {
        console.warn("[processAppImages] Skipping image with missing screenshot URL.");
        updatedImages.push({
          originalUrl: image.screenshot || null,
          removedBgUrl: null,
          error: "Screenshot URL is missing",
        });
        continue;
      }

      if (image.removed_bg_image) {
        console.log(`[processAppImages] Skipping already processed image: ${image.screenshot}`);
        updatedImages.push(image);
        continue;
      }

      try {
        console.log(`[processAppImages] Removing background for image: ${image.screenshot}`);
        const noBgBuffer = await removeBackground(image.screenshot);

        console.log(`[processAppImages] Uploading processed image to S3 for: ${image.screenshot}`);
        const s3Url = await uploadToS3(noBgBuffer, `extracted_images/${appId}`, `${appId}-${Date.now()}.png`);

        console.log(`[processAppImages] Extracting background color for: ${image.screenshot}`);
        const backgroundColor = await extractBackgroundColor(image.screenshot);

        console.log(`[processAppImages] Extracting text color for: ${image.screenshot}`);
        const textColor = await extractTextColor(backgroundColor);

        updatedImages.push({
          originalUrl: image.screenshot,
          removedBgUrl: s3Url,
          backgroundColor: backgroundColor,
          textColor: textColor,
        });
      } catch (error) {
        console.error(`[processAppImages] Error processing image: ${image.screenshot}`, error.message);
        updatedImages.push({
          originalUrl: image.screenshot,
          removedBgUrl: null,
          backgroundColor: null,
          textColor: null,
          error: error.message,
        });
      }
    }

    console.log(`[processAppImages] Updating images in database for app: ${appId}`);
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      { $set: { images: updatedImages } }
    );

    console.log("[processAppImages] Images updated successfully in database.");

    // Return updated data
    return {
      updatedImages,
    };
  } finally {
    await client.close();
    console.log("[processAppImages] MongoDB connection closed.");
  }
};

export const generateAdImages = async (appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");
  const adCopiesCollection = db.collection("AdCopies");
  const creativesCollection = db.collection("Creatives");

  try {
    console.log(`[generateAdImages] Fetching app and phrases for appId: ${appId}`);

    // Fetch app data
    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app || !Array.isArray(app.images)) {
      throw new Error("[generateAdImages] App not found or invalid image field.");
    }

    // Fetch approved phrases
    const adCopy = await adCopiesCollection.findOne({ appId });
    if (!adCopy || !Array.isArray(adCopy.phrases)) {
      throw new Error("[generateAdImages] No phrases found for appId: " + appId);
    }

    const approvedPhrases = adCopy.phrases
      .filter((p) => p.status === "approved")
      .map((p) => p.text);

    if (approvedPhrases.length === 0) {
      throw new Error("[generateAdImages] No approved phrases available.");
    }

    console.log("[generateAdImages] Approved phrases fetched successfully:", approvedPhrases);

    // Fetch font family and font file
    console.log("[generateAdImages] Fetching font details from the app's website...");
    const fontDetails = await fetchFont(app.websiteUrl);
    console.log("[generateAdImages] Font details fetched successfully:", fontDetails);
    console.log(`[generateAdImages] Font Family fetched: ${fontDetails.fontName}, URL: ${fontDetails.fontPath}`);

    // const outputDir = path.join(process.cwd(), "ads");
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir, { recursive: true });
    // }

    const ads = [];
    let phraseIndex = 0;

    for (const image of app.images) {
      if (!image.removedBgUrl || !image.backgroundColor) {
        console.warn(`[generateAdImages] Skipping image with missing background info: ${image.originalUrl}`);
        continue;
      }

      for (const { width, height, name } of adDimensionsConfig) {
        const currentPhrase = approvedPhrases[phraseIndex];
        phraseIndex = (phraseIndex + 1) % approvedPhrases.length;

        // Get optimal text color based on background
        let adjustedTextColor = getOptimalTextColor(image.backgroundColor);

        // Verify and adjust text color if needed
        if (areColorsSimilar(image.backgroundColor, adjustedTextColor)) {
          adjustedTextColor = getContrastingColor(image.backgroundColor);
        }

        // Handle CTA colors
        let adjustedCTAColor = app.iconBackgroundColor;
        let adjustedCTATextColor = adjustedTextColor; // Start with the main text color

        // Check if CTA background is similar to image background
        if (areColorsSimilar(image.backgroundColor, adjustedCTAColor)) {
          adjustedCTAColor = getContrastingColor(image.backgroundColor);
        }

        // Ensure CTA text has good contrast with CTA background
        if (areColorsSimilar(adjustedCTAColor, adjustedCTATextColor)) {
          adjustedCTATextColor = getContrastingColor(adjustedCTAColor);
        }

        const adOptions = {
          logoUrl: app.iconUrl,
          mainImageUrl: image.removedBgUrl,
          fontName: fontDetails.fontName,
          fontPath: fontDetails.fontPath,
          phrase: currentPhrase,
          outputDir: path.join(process.cwd(), "ads", name),
          bgColor: image.backgroundColor,
          adDimensions: { width, height },
          fontSize: width > 300 ? "24px" : "16px",
          textColor: adjustedTextColor,
          ctaText: app.CTA,
          ctaColor: adjustedCTAColor,
          ctaTextColor: adjustedCTATextColor,
        };

        console.log("[CreativeService] Generating ad with options:", adOptions);

        try {
          const adPath = await createAd(adOptions);

          // Upload ad to S3
          // const s3Url = await uploadToS3(fs.readFileSync(adPath), `creatives/${appId}`, `ad-${name}-${Date.now()}.png`);

          ads.push({
            filePath: adPath,
            phrase: currentPhrase,
            // adUrl: s3Url,
            size: name,
          });

          console.log(`[CreativeService] Ad generated successfully for size ${name}:`, adPath);
          console.log(`[CreativeService] Ad uploaded to S3 successfully for size ${name}:`, s3Url);
        } catch (error) {
          console.error(`[CreativeService] Error generating ad for size ${name}:`, error.message);
        }
      }
    }

    console.log("[generateAdImages] Ad generation and upload process completed. Total ads:", ads.length);

    // Save to Creatives Collection
    const creativesDocument = {
      appId,
      phrases: approvedPhrases.map((text) => ({ text, status: "used" })),
      adUrls: ads.map((ad) => ({
        creativeUrl: ad,
        status: "pending"
      })),
      createdAt: new Date(),
    };

    const result = await creativesCollection.insertOne(creativesDocument);
    console.log("[CreativeService] Creatives document saved successfully.", result.insertedId);

    return { ...creativesDocument, _id: result.insertedId };
  } catch (error) {
    console.error("[CreativeService] Error during ad generation:", error.message);
    throw error;
  } finally {
    await client.close();
    console.log("[CreativeService] MongoDB connection closed.");
  }
};