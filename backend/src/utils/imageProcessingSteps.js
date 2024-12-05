import fetch from "node-fetch";
import FormData from "form-data";
import puppeteer from "puppeteer";
import { s3 } from "../config/aws.js";
import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";
import { getBackgroundColor } from "./colorExtraction.js";
import { saveFontToTemp } from "./fontDownload.js";

/**
 * Remove the background of an image using the remove-bg API.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<Buffer>} - Returns the processed image as a buffer.
 */
export const removeBackground = async (imageUrl) => {
  const apiKey = "Q46dvgPSGYZBm6qWvcNgNkeU"; // Move to .env for better security
  try {
    console.log(`[removeBackground] Removing background for image URL: ${imageUrl}`);

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", imageUrl);

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[removeBackground] Failed: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Remove-bg API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log(`[removeBackground] Successfully removed background for image: ${imageUrl}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error(`[removeBackground] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Upload an image to S3.
 * @param {Buffer} buffer - The image buffer.
 * @param {string} appId - The app ID for organizing images.
 * @param {string} filename - The name of the file to save in S3.
 * @returns {Promise<string>} - Returns the public URL of the uploaded image.
 */
export const uploadToS3 = async (buffer, appId, filename) => {
  const key = `apps/${appId}/removed_bg/${filename}`;
  try {
    console.log(`[uploadToS3] Uploading image to S3: ${key}`);

    const params = {
      Bucket: "performace-extracted-images",
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: "image/png",
      ACL: "public-read",
    };

    const data = await s3.upload(params).promise();
    // console.log(`[uploadToS3] Successfully uploaded image to S3: ${data.Location}`);
    return data.Location;
  } catch (error) {
    console.error("[uploadToS3] Error uploading to S3:", error.message);
    throw error;
  }
};

/**
 * Extract the background color of an image using the Python script.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<string>} - Returns the background color in `rgb()` format.
 */
export const extractBackgroundColor = async (imageUrl) => {
  try {
    console.log(`[extractBackgroundColor] Extracting background color for image: ${imageUrl}`);
    const backgroundColor = await getBackgroundColor(imageUrl);
    console.log(`[extractBackgroundColor] Extracted background color: ${backgroundColor}`);
    return backgroundColor;
  } catch (error) {
    console.error(`[extractBackgroundColor] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch approved phrases from the AdCopies collection based on appId.
 * @param {string} appId - The App ID for which to fetch approved phrases.
 * @returns {Promise<Array<string>>} - An array of approved phrases.
 */
export const fetchApprovedPhrases = async (appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[fetchApprovedPhrases] Fetching approved phrases for appId: ${appId}`);

    // Query to find the AdCopies document for the given appId
    const adCopy = await adCopiesCollection.findOne({ appId });

    if (!adCopy || !Array.isArray(adCopy.phrases)) {
      throw new Error(`[fetchApprovedPhrases] No AdCopy found for appId: ${appId}`);
    }

    // Filter approved phrases
    const approvedPhrases = adCopy.phrases
      .filter((phraseObj) => phraseObj.status === "approved")
      .map((phraseObj) => phraseObj.text);

    console.log(`[fetchApprovedPhrases] Approved phrases: ${approvedPhrases}`);
    return approvedPhrases;
  } catch (error) {
    console.error("[fetchApprovedPhrases] Error fetching approved phrases:", error.message);
    throw error;
  } finally {
    await client.close();
  }
};

/**
 * Fetch the icon URL for an app from the Apps collection.
 * @param {string} appId - The App ID for which to fetch the icon URL.
 * @returns {Promise<string>} - The icon URL.
 */
export const fetchIconUrl = async (appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  try {
    console.log(`[fetchIconUrl] Fetching icon URL for appId: ${appId}`);

    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app) {
      throw new Error(`[fetchIconUrl] App with ID ${appId} not found.`);
    }

    console.log(`[fetchIconUrl] Fetched icon URL: ${app.iconUrl}`);
    return app.iconUrl;
  } catch (error) {
    console.error("[fetchIconUrl] Error fetching icon URL:", error.message);
    throw error;
  } finally {
    await client.close();
  }
};

/**
 * Fetch the website URL for an app from the Apps collection.
 * @param {string} appId - The App ID for which to fetch the website URL.
 * @returns {Promise<string>} - The website URL.
 */
export const fetchWebsiteUrl = async (appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  try {
    console.log(`[fetchWebsiteUrl] Fetching website URL for appId: ${appId}`);

    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app) {
      throw new Error(`[fetchWebsiteUrl] App with ID ${appId} not found.`);
    }

    console.log(`[fetchWebsiteUrl] Fetched website URL: ${app.websiteUrl}`);
    return app.websiteUrl;
  } catch (error) {
    console.error("[fetchWebsiteUrl] Error fetching website URL:", error.message);
    throw error;
  } finally {
    await client.close();
  }
};

/**
 * Fetch the font for an app from the website URL.
 * @param {string} websiteUrl - The website URL for which to fetch the font.
 * @returns {Promise<{fontName: string, fontPath: string}>} - The font family and its local path.
 */
export const fetchFont = async (websiteUrl) => {
  let browser = null;
  try {
    console.log(`[fetchFont] Fetching font for website: ${websiteUrl}`);

    // Launch Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the website
    console.log(`[fetchFont] Navigating to ${websiteUrl}`);
    await page.goto(websiteUrl, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(`[fetchFont] Website loaded successfully.`);

    // Extract the font family from <h1>
    console.log(`[fetchFont] Extracting font-family from <h1>`);
    const fontFamily = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const computedStyle = h1 ? window.getComputedStyle(h1) : null;
      return computedStyle ? computedStyle.fontFamily : "abc"; // Default to "abc" if no font is found
    });

    console.log(`[fetchFont] Font extracted: ${fontFamily}`);

    // Call saveFontToTemp to download the font
    const fontDetails = await saveFontToTemp(fontFamily, websiteUrl);

    console.log(`[fetchFont] Font downloaded: ${fontDetails.fontName}, Path: ${fontDetails.fontPath}`);
    return fontDetails;
  } catch (error) {
    console.error(`[fetchFont] Error fetching font: ${error.message}`);
    return { fontName: "abc", fontPath: null }; // Return default font on error
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};