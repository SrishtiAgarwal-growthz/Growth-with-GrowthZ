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

    // Fetch website URL
    const websiteUrl = await fetchWebsiteUrl(appId);
    console.log(`[processAppImages] Website URL fetched: ${websiteUrl}`);

    // Fetch font family and font file
    const fontDetails = await fetchFont(websiteUrl);
    console.log(`[processAppImages] Font Family fetched: ${fontDetails.fontFamily}, URL: ${fontDetails.fontUrl}`);

    // Save font URL in the app's document
    await appsCollection.updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          fontUrl: fontDetails.fontUrl, // Save the URL instead of the local path
          fontFamily: fontDetails.fontFamily,
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
      fontFamily: fontDetails.fontFamily,
      fontUrl: fontDetails.fontUrl,
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

    console.log("App Data:", app);

    // Fetch approved phrases
    const adCopy = await adCopiesCollection.findOne({ appId });
    if (!adCopy || !Array.isArray(adCopy.phrases)) {
      throw new Error("[generateAdImages] No phrases found for appId: " + appId);
    }

    const approvedPhrases = adCopy.phrases.filter((p) => p.status === "approved").map((p) => p.text);
    console.log("Approved Phrases:", approvedPhrases);

    if (approvedPhrases.length === 0) {
      throw new Error("[generateAdImages] No approved phrases available.");
    }

    const ads = [];
    const outputDir = path.join(process.cwd(), "ads"); // Directory to save ads

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Cycle through phrases
    let phraseIndex = 0;

    for (const image of app.images) {
      if (!image.removedBgUrl || !image.backgroundColor) {
        console.warn(`[generateAdImages] Skipping image with missing background info: ${image.originalUrl}`);
        continue;
      }

      const currentPhrase = approvedPhrases[phraseIndex];
      phraseIndex = (phraseIndex + 1) % approvedPhrases.length; // Cycle through phrases

      const adOptions = {
        logoUrl: app.iconUrl,
        mainImageUrl: image.removedBgUrl,
        fontFamily: app.fontFamily,
        fontUrl: app.fontUrl,
        phrase: currentPhrase,
        outputDir, // Directory to save the generated ad
        bgColor: image.backgroundColor, // Use the corresponding background color
      };

      console.log("Creating ad with options:", adOptions);

      const adPath = await createAd(adOptions);
      ads.push({ filePath: adPath, phrase: currentPhrase });
    }

    console.log(`[generateAdImages] Ads saved locally for appId: ${appId}`);
    return ads;
  } finally {
    await client.close();
    console.log("[generateAdImages] MongoDB connection closed.");
  }
};
