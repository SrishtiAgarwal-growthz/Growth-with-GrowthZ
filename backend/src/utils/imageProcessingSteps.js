import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import puppeteer from "puppeteer";
import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";
import { s3 } from "../config/aws.js";
import { fileURLToPath } from "url";
import { getBackgroundColor } from "./colorExtraction.js";
import { saveFontToTemp } from "./fontDownload.js";
import { createCanvas, loadImage } from 'canvas';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.resolve(__dirname, "fonts");

/**
 * Remove the background of an image using the remove-bg API.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<Buffer>} - Returns the processed image as a buffer.
 */
export const removeBackground = async (imageUrl, options = {}) => {
  const {
    crop = true,
    cropMargin = '10%',
    scale = 'original',
    position = scale !== 'original' ? 'center' : 'original'
  } = options;

  const apiKey = process.env.REMOVE_BG_API_KEY; // Move to .env for better security

  try {
    console.log(`[removeBackground] Processing image URL: ${imageUrl} with options:`, options);

    const formData = new FormData();

    // Basic parameters
    formData.append("size", "auto");
    formData.append("image_url", imageUrl);

    // Cropping parameters
    formData.append("crop", crop.toString());
    if (crop && cropMargin) {
      formData.append("crop_margin", cropMargin);
    }

    // Scaling parameter
    if (scale !== 'original') {
      if (!scale.endsWith('%')) {
        throw new Error('Scale must be "original" or a percentage (e.g., "80%")');
      }
      const scaleValue = parseInt(scale);
      if (scaleValue < 10 || scaleValue > 100) {
        throw new Error('Scale percentage must be between 10% and 100%');
      }
      formData.append("scale", scale);
    }

    // Position parameter
    if (position !== 'original') {
      if (position === 'center') {
        formData.append("position", position);
      } else if (typeof position === 'string' && position.includes(',')) {
        // Handle x,y positioning
        const [x, y] = position.split(',').map(v => v.trim());
        if (!x.endsWith('%') || !y.endsWith('%')) {
          throw new Error('Position values must be percentages (e.g., "50%,50%")');
        }
        formData.append("position", `${x},${y}`);
      } else {
        throw new Error('Position must be "original", "center", or "x%,y%"');
      }
    }

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

    console.log(`[removeBackground] Successfully processed image: ${imageUrl}`);
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
export const uploadToS3 = async (buffer, bucketFolder, fileName) => {

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${bucketFolder}/${fileName}`,
      Body: Buffer.from(buffer),
      ContentType: "image/png",
      ACL: "public-read",
      Metadata: {
        FileType: bucketFolder.includes("creatives") ? "Creative" : "ExtractedImage",
      },
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
const genericFonts = ["system-ui", "sans-serif", "serif", "monospace", "cursive", "fantasy"];

export const fetchFont = async (websiteUrl) => {
  let browser = null;
  try {
    console.log(`[fetchFont] Fetching font for website: ${websiteUrl}`);

    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`[fetchFont] Navigating to ${websiteUrl}`);
    await page.goto(websiteUrl, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(`[fetchFont] Website loaded successfully.`);

    console.log(`[fetchFont] Extracting font-family from <h1>`);
    const fontDetails = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return { fontFamily: null };

      const computedStyle = window.getComputedStyle(h1);
      return {
        fontFamily: computedStyle.fontFamily || null,
      };
    });

    let fontName = fontDetails.fontFamily || "default";

    fontName = fontName.replace(/['"]/g, "").split(",")[0].trim();

    // Skip generic fonts
    if (genericFonts.includes(fontName.toLowerCase())) {
      console.warn(`[fetchFont] Generic font "${fontName}" detected. Using fallback font "Inter".`);
      return {
        fontName: "Inter",
        fontPath: null,
        fontUrl: null,
      };
    }

    console.log(`[fetchFont] Extracted prioritized font: ${fontName}`);

    const fontFile = await saveFontToTemp(fontName, websiteUrl);
    console.log(`[fetchFont] Font saved at: ${fontFile.fontPath}`);
    return {
      fontName: fontFile.fontName,
      fontPath: fontFile.fontPath,
      fontUrl: fontFile.fontUrl,
    };
  } catch (error) {
    console.error(`[fetchFont] Error fetching font: ${error.message}`);
    return {
      fontName: "Inter", // Default fallback font
      fontPath: null,
      fontUrl: null,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Fetch the text color for an app from the image URL.
 * @param {string} imageUrl - The image URL for which to fetch the text color.
 * @returns {Promise<{textColor: string}>} - The text color of image.
 */
export const extractTextColor = (backgroundColor) => {
  try {
    console.log(`[extractTextColor] Analyzing background color: ${backgroundColor}`);

    // Parse the RGB color format: "rgb(r, g, b)"
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) {
      throw new Error("Invalid RGB format");
    }

    const r = parseInt(rgbMatch[1], 10); // Red value
    const g = parseInt(rgbMatch[2], 10); // Green value
    const b = parseInt(rgbMatch[3], 10); // Blue value

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Determine text color based on luminance
    const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF';

    console.log(`[extractTextColor] Analysis complete. Text Color: ${textColor}`);
    return textColor;
  } catch (error) {
    console.error('[extractTextColor] Error:', error);
    return '#000000'; // Default to black text
  }
};

// Mapping of categories to CTAs (Alphabetically Ordered)
const categoryToCTAMapping = {
  "Action": "Play Now",
  "Adventure": "Explore Now",
  "Arcade": "Play Now",
  "Art & Design": "Create Now",
  "Auto & Vehicles": "Book a Test Drive",
  "Beauty": "Shop Now",
  "Board": "Challenge Yourself",
  "Books & Reference": "Read Now",
  "Business": "Boost Productivity",
  "Card": "Deal Now",
  "Casino": "Spin & Win Now",
  "Casual": "Play Anytime",
  "Comics": "Read Now",
  "Communication": "Connect Now",
  "Dating": "Find Your Match",
  "Developer Tools": "Code Now",
  "Education": "Learn More",
  "Entertainment": "Enjoy Now",
  "Events": "Book a Ticket Now",
  "Family": "Fun for Everyone",
  "Finance": "Invest Now",
  "Food & Drink": "Order Now",
  "Gaming": "Play Now",
  "Graphics & Design": "Design Now",
  "Health & Fitness": "Start Now",
  "House & Home": "Upgrade Now",
  "Kids": "Fun and Learn",
  "Libraries & Demo": "Explore Now",
  "Lifestyle": "Buy Now",
  "Maps & Navigation": "Navigate Now",
  "Medical": "Manage Health Now",
  "Music": "Play to the Beat",
  "Music & Audio": "Listen Now",
  "News & Magazines": "Stay Informed",
  "Parenting": "Help Your Family",
  "Personalization": "Customize Now",
  "Photography": "Capture the Moment",
  "Productivity": "Get Things Done",
  "Puzzle": "Solve Now",
  "Racing": "Race Now",
  "Reference": "Explore Now",
  "Role Playing": "Begin Your Journey",
  "Shopping": "Buy Now",
  "Simulation": "Build Your World",
  "Social": "Connect Now",
  "Sports": "Track Your Team",
  "Stickers": "Express Yourself",
  "Strategy": "Plan and Win",
  "Tools": "Upgrade Your Tasks",
  "Travel & Local": "Book Now",
  "Trivia": "Test Your Knowledge",
  "Video Players": "Watch Now",
  "Weather": "Stay Updated",
  "Word": "Expand Your Vocabulary"
};

// Function to return CTA based on category
export const fetchCTAForCategory = async (appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const appsCollection = db.collection("Apps");

  try {
    console.log(`[fetchCTA] Fetching CTA for appId: ${appId}`);

    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    if (!app) {
      throw new Error(`[fetchCTA] App with ID ${appId} not found.`);
    }

    const CTA = categoryToCTAMapping[app.category];
    console.log(`[fetchCTA] Fetched CTA: ${CTA}`);
    return CTA || "CTA Not Found";
  } catch (error) {
    console.error("[fetchCTA] Error fetching CTA:", error.message);
    throw error;
  } finally {
    await client.close();
  }
};