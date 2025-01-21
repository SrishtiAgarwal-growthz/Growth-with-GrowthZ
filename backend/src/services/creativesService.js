import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
  // fetchCTAForCategory,
} from "../utils/imageProcessingSteps.js";
import {
  rgbToArray,
  areColorsSimilar,
  isColorCloserToWhite,
  getContrastingColor,
  getOptimalTextColor,
} from "../utils/colorUtils.js";
import { createAd } from "../utils/puppeteerAdGenerator.js";
import { adDimensionsConfig } from "../utils/adDimensions.js";
import { animationDimensionsConfig } from "../utils/animationsDimensions.js";
import { createAnimations } from "../utils/animationGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process app images: remove background, upload to S3, extract background color, and identify font.
 * Checks if "imagesProcessed" is already true in the app doc; if so, it skips.
 */
export const processAppImages = async (appId, userId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  try {
    console.log(`[processAppImages] Processing images for app: ${appId}`);

    const appDoc = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!appDoc) {
      throw new Error(`App not found for id: ${appId}`);
    }

    // Explicitly convert to boolean and log the value for debugging
    const isProcessed = Boolean(appDoc.imagesProcessed);
    console.log("[processAppImages] Current imagesProcessed value:", isProcessed);

    // Check if already processed
    if (isProcessed === true) {
      console.log("[processAppImages] Images already processed => Skipping remove-bg calls.");
      return {
        message: "Images were already processed. Skipped remove-bg.",
        updatedImages: appDoc.images || [],
      };
    }

    console.log("[processAppImages] imagesProcessed is false => Running remove-bg...");

    // -- Fetch icon URL
    const iconUrl = await fetchIconUrl(appId);
    console.log(`[processAppImages] Icon URL fetched: ${iconUrl}`);

    const iconBackgroundColor = await extractBackgroundColor(iconUrl);
    console.log(`[processAppImages] Extracting logo background color for: ${iconUrl}`);

    // -- Fetch website URL
    const websiteUrl = await fetchWebsiteUrl(appId);
    console.log(`[processAppImages] Website URL fetched: ${websiteUrl}`);

    // // -- Fetch CTA
    // const CTA = await fetchCTAForCategory(appId);
    // console.log(`[processAppImages] CTA fetched: ${CTA}`);

    // Save some fields in the app doc
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          iconBackgroundColor: iconBackgroundColor,
          // CTA: CTA,
        },
      }
    );
    console.log(`[processAppImages] Additional fields saved in the app doc for appId: ${appId}`);

    // 2) Loop over screenshots
    let updatedImages = [];
    if (!Array.isArray(appDoc.images)) {
      console.warn("[processAppImages] 'images' is not an array in the app doc.");
    } else {
      // Take only the first three images for processing
      const imagesToProcess = appDoc.images.slice(0, 5);
      const remainingImages = appDoc.images.slice(5);

      for (const image of imagesToProcess) {
        if (!image.screenshot) {
          console.warn("[processAppImages] Skipping image with missing screenshot URL.");
          updatedImages.push({
            originalUrl: image.screenshot || null,
            removedBgUrl: null,
            error: "Screenshot URL is missing",
          });
          continue;
        }

        // If already has removed_bg_image, skip
        if (image.removed_bg_image) {
          console.log(`[processAppImages] Skipping already processed image: ${image.screenshot}`);
          updatedImages.push(image);
          continue;
        }

        try {
          console.log(`[processAppImages] Removing background for image: ${image.screenshot}`);
          const noBgBuffer = await removeBackground(image.screenshot);

          console.log(`[processAppImages] Uploading processed image to S3 for: ${image.screenshot}`);
          const s3Url = await uploadToS3(
            noBgBuffer,
            `extracted_images/${appId}`,
            `${appId}-${Date.now()}.png`
          );

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
          console.error(
            `[processAppImages] Error processing image: ${image.screenshot}`,
            error.message
          );
          updatedImages.push({
            originalUrl: image.screenshot,
            removedBgUrl: null,
            backgroundColor: null,
            textColor: null,
            error: error.message,
          });
        }
      }

      // Add remaining images to updatedImages without processing
      updatedImages = [...updatedImages, ...remainingImages.map(image => ({
        originalUrl: image.screenshot,
        removedBgUrl: null,
        backgroundColor: null,
        textColor: null,
        skipped: "Image beyond first three limit"
      }))];
    }

    console.log(`[processAppImages] Updating images in database for app: ${appId}`);

    // 3) Mark imagesProcessed = true after we finish the loop (Even if some failed, we won't keep re-trying).
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          images: updatedImages,
          imagesProcessed: true,
        },
      }
    );

    console.log("[processAppImages] Images updated successfully and imagesProcessed set to true.");

    // Verify the update
    const verifyDoc = await appsCollection.findOne({ _id: new ObjectId(appId) });
    console.log("[processAppImages] Verified imagesProcessed value after update:", Boolean(verifyDoc.imagesProcessed));

    // Return updated data
    return {
      updatedImages,
      message: "Images processed successfully.",
    };
  } catch (error) {
    console.error("[processAppImages] Error:", error);
    throw error;
  } finally {
    await client.close();
    console.log("[processAppImages] MongoDB connection closed.");
  }
};

export const generateAdImages = async (appId, userId) => {
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
    console.log(
      `[generateAdImages] Font Family fetched: ${fontDetails.fontName}, URL: ${fontDetails.fontPath}`
    );

    const ads = [];
    let phraseIndex = 0;

    // Use only the first three images with `removedBgUrl`
    const processedImages = app.images
      .filter((image) => image.removedBgUrl && image.backgroundColor)
      .slice(0, 3); // Limit to first three images

    for (const { width, height, name } of adDimensionsConfig) {
      for (const image of processedImages) {
        const currentPhrase = approvedPhrases[phraseIndex];
        phraseIndex = (phraseIndex + 1) % approvedPhrases.length; // Cycle through phrases

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
          ctaText: "INSTALL NOW",
          ctaColor: adjustedCTAColor,
          ctaTextColor: adjustedCTATextColor,
        };

        console.log("[CreativeService] Generating ad with options:", adOptions);

        try {
          const adPath = await createAd(adOptions);

          // If you want to upload to S3:
          const s3Url = await uploadToS3(
            fs.readFileSync(adPath),
            `creatives/${appId}`,
            `ad-${appId}-${name}-${Date.now()}.png`
          );

          ads.push({
            phrase: currentPhrase,
            adUrl: s3Url,
            size: name,
          });

          console.log(`[generateAdImages] Ad generated and uploaded: ${s3Url}`);
        } catch (error) {
          console.error(`[generateAdImages] Error generating ad for size ${name}:`, error.message);
        }
      }
    }

    // Save ads to database
    if (ads.length > 0) {
      await creativesCollection.updateOne(
        { appId, userId },
        {
          $push: {
            adUrls: {
              $each: ads.map((ad) => ({ creativeUrl: ad, status: "pending" })),
            },
          },
        },
        { upsert: true }
      );
    }

    console.log(`[generateAdImages] Ad generation completed. Total ads: ${ads.length}`);
    return ads;
  } catch (error) {
    console.error(`[generateAdImages] Error: ${error.message}`);
    throw error;
  } finally {
    await client.close();
    console.log("[generateAdImages] MongoDB connection closed.");
  }
};

export const generateAdAnimation = async (appId, userId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");
  const adCopiesCollection = db.collection("AdCopies");
  const creativesCollection = db.collection("Creatives");

  try {
    console.log(`[generateAdAnimation] Fetching app and phrases for appId: ${appId}`);

    // Fetch app data
    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app || !Array.isArray(app.images)) {
      throw new Error("[generateAdAnimation] App not found or invalid image field.");
    }

    // Fetch approved phrases
    const adCopy = await adCopiesCollection.findOne({ appId });
    if (!adCopy || !Array.isArray(adCopy.phrases)) {
      throw new Error("[generateAdAnimation] No phrases found for appId: " + appId);
    }

    const approvedPhrases = adCopy.phrases
      .filter((p) => p.status === "approved")
      .map((p) => p.text);

    if (approvedPhrases.length === 0) {
      throw new Error("[generateAdAnimation] No approved phrases available.");
    }

    console.log("[generateAdAnimation] Approved phrases fetched successfully:", approvedPhrases);

    // Fetch font family and font file
    console.log("[generateAdAnimation] Fetching font details from the app's website...");
    const fontDetails = await fetchFont(app.websiteUrl);
    console.log("[generateAdAnimation] Font details fetched successfully:", fontDetails);

    const animations = [];
    let phraseIndex = 0;

    // Use only the first three images with `removedBgUrl`
    const processedImages = app.images
      .filter((image) => image.removedBgUrl && image.backgroundColor)
      .slice(0, 3); // Limit to first three images

    for (const { width, height, name } of animationDimensionsConfig) {
      for (const image of processedImages) {
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
          outputDir: path.join(process.cwd(), "animations", name),
          bgColor: image.backgroundColor,
          adDimensions: { width, height },
          fontSize: width > 300 ? "24px" : "16px",
          textColor: adjustedTextColor,
          ctaText: "INSTALL NOW",
          ctaColor: adjustedCTAColor,
          ctaTextColor: adjustedCTATextColor,
        };

        console.log("[CreativeService] Generating animations with options:", adOptions);

        try {
          const animationPath = await createAnimations(adOptions);

          const s3Url = await uploadToS3(
            fs.readFileSync(animationPath),
            `creatives/${appId}`,
            `animation-${appId}-${name}-${Date.now()}.mp4`
          );

          animations.push({
            phrase: currentPhrase,
            animationUrl: s3Url,
            size: name,
          });

          console.log(`[generateAdAnimation] Animation generated and uploaded: ${s3Url}`);
        } catch (error) {
          console.error(`[generateAdAnimation] Error generating animation for size ${name}:`, error.message);
        }
      }
    }

    // Save animations to database
    if (animations.length > 0) {
      await creativesCollection.updateOne(
        { appId, userId },
        {
          $push: {
            animationUrls: {
              $each: animations.map((anim) => ({ creativeUrl: anim, status: "pending" })),
            },
          },
        },
        { upsert: true }
      );
    }

    console.log(`[generateAdAnimation] Animation generation completed. Total animations: ${animations.length}`);
    return animations;
  } catch (error) {
    console.error(`[generateAdAnimation] Error: ${error.message}`);
    throw error;
  } finally {
    await client.close();
    console.log("[generateAdAnimation] MongoDB connection closed.");
  }
};
