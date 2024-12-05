import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";
import {
  removeBackground,
  uploadToS3,
  extractBackgroundColor,
  fetchApprovedPhrases,
  fetchIconUrl,
  fetchWebsiteUrl,
  fetchFont,
} from "../utils/imageProcessingSteps.js";
// import { createAd } from "../utils/adGenerator.js";

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

    // Fetch website URL
    const websiteUrl = await fetchWebsiteUrl(appId);
    console.log(`[processAppImages] Website URL fetched: ${websiteUrl}`);

    // Fetch font family and font file
    const fontDetails = await fetchFont(websiteUrl);
    console.log(`[processAppImages] Font Family fetched: ${fontDetails.fontName}, Path: ${fontDetails.fontPath}`);

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

        updatedImages.push({
          originalUrl: image.screenshot,
          removedBgUrl: s3Url,
          backgroundColor: backgroundColor,
        });
      } catch (error) {
        console.error(`[processAppImages] Error processing image: ${image.screenshot}`, error.message);
        updatedImages.push({
          originalUrl: image.screenshot,
          removedBgUrl: null,
          backgroundColor: null,
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
      fontName: fontDetails.fontName,
      fontPath: fontDetails.fontPath,
    };
  } finally {
    await client.close();
    console.log("[processAppImages] MongoDB connection closed.");
  }
};