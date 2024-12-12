import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";
import {
  removeBackground,
  uploadToS3,
  extractBackgroundColor,
  extractTextColor,
  fetchApprovedPhrases,
  fetchIconUrl,
  fetchWebsiteUrl,
  fetchFont,
} from "../utils/imageProcessingSteps.js";
import { createAd } from "../utils/puppeteerAdGenerator.js";
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

    // Fetch approved phrases
    const approvedPhrases = await fetchApprovedPhrases(appId);
    console.log(`[processAppImages] Approved phrases fetched: ${approvedPhrases}`);

    // Fetch icon URL
    const iconUrl = await fetchIconUrl(appId);
    console.log(`[processAppImages] Icon URL fetched: ${iconUrl}`);

    const iconBackgroundColor = await extractBackgroundColor(iconUrl);
    console.log(`[processAppImages] Extracting logo background color for: ${iconUrl}`);

    // Fetch website URL
    const websiteUrl = await fetchWebsiteUrl(appId);
    console.log(`[processAppImages] Website URL fetched: ${websiteUrl}`);

    // Fetch font family and font file
    const fontDetails = await fetchFont(websiteUrl);
    console.log(`[processAppImages] Font Family fetched: ${fontDetails.fontName}, URL: ${fontDetails.fontPath}`);

    // Save font URL in the app's document
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          iconBackgroundColor: iconBackgroundColor,
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
        const s3Url = await uploadToS3(noBgBuffer, appId, `${Date.now()}.png`);

        console.log(`[processAppImages] Extracting background color for: ${image.screenshot}`);
        const backgroundColor = await extractBackgroundColor(image.screenshot);

        console.log(`[processAppImages] Extracting text color for: ${image.screenshot}`);
        const textColor = await extractTextColor(image.screenshot);

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
      approvedPhrases,
      iconUrl,
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

    const ads = [];
    const outputDir = path.join(process.cwd(), "ads");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let phraseIndex = 0;

    for (const image of app.images) {
      if (!image.removedBgUrl || !image.backgroundColor) {
        console.warn(`[generateAdImages] Skipping image with missing background info: ${image.originalUrl}`);
        continue;
      }

      const currentPhrase = approvedPhrases[phraseIndex];
      phraseIndex = (phraseIndex + 1) % approvedPhrases.length;

      try {
        const adOptions = {
          logoUrl: app.iconUrl,
          mainImageUrl: image.removedBgUrl,
          fontFamily: app.fontFamily,
          fontUrl: app.fontUrl,
          phrase: currentPhrase,
          outputDir,
          bgColor: image.backgroundColor,
          adDimensions: { width: 160, height: 600 },
          fontSize: '24px',
          textColor: image.textColor,
          ctaText: "Order Now",
          ctaColor: app.iconBackgroundColor,
          ctaTextColor: image.textColor,
        };

        console.log(`[generateAdImages] Creating ad for image with options:`, {
          ...adOptions,
          fontUrl: adOptions.fontUrl ? 'Present' : 'Not present',
        });

        const adPath = await createAd(adOptions);
        ads.push({
          filePath: adPath,
          phrase: currentPhrase,
          imageUrl: image.removedBgUrl
        });

        console.log(`[generateAdImages] Ad created successfully: ${adPath}`);
      } catch (error) {
        console.error(`[generateAdImages] Error generating ad for image: ${image.removedBgUrl}`, error);
      }
    }

    console.log(`[generateAdImages] Successfully generated ${ads.length} ads for appId: ${appId}`);
    return ads;
  } finally {
    await client.close();
    console.log("[generateAdImages] MongoDB connection closed.");
  }
};