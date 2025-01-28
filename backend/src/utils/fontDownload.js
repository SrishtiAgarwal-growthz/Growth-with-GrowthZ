import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const sanitizeName = (name) => {
  return name
    .replace(/[^a-z0-9]/gi, '_') // Replace special chars with underscore
    .replace(/_+/g, '_')         // Replace multiple underscores with single
    .toLowerCase()               // Convert to lowercase
    .trim();                     // Remove trailing spaces
};

// Initialize puppeteer with stealth plugin
puppeteer.use(StealthPlugin());

// Helper function to determine font format
const getFontFormat = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const formatMap = {
    woff2: "woff2",
    woff: "woff",
    ttf: "truetype",
    otf: "opentype",
  };
  return formatMap[ext] || "woff2";
};

// Helper function to convert font to base64
const convertFontToBase64 = (fontPath) => {
  const fontBuffer = fs.readFileSync(fontPath);
  const base64Font = fontBuffer.toString('base64');
  const format = path.extname(fontPath).toLowerCase().replace('.', '');
  
  const mimeTypes = {
    'woff2': 'application/font-woff2',
    'woff':  'application/font-woff',
    'ttf':   'application/x-font-ttf',
    'otf':   'application/x-font-opentype'
  };
  
  
  const mimeType = mimeTypes[format] || 'font/woff2';
  return `data:${mimeType};base64,${base64Font}`;
};

/**
 * Downloads and saves the first font file found on a website
 * @param {string} appName - Identifier for the app/website
 * @param {string} websiteUrl - URL of the website to fetch font from
 * @returns {Promise<{
 *   fontPath: string,
 *   fontFamily: string,
 *   fontUrl: string,
 *   css: string,
 *   base64Font: string
 * } | null>} Font details or null if no font found
 */
export async function fetchFont(appName, websiteUrl) {
  let browser = null;
  appName = sanitizeName(appName);
  let isFirstFontProcessed = false; // Flag to track if we've processed the first font

  try {
    // Launch browser
    browser = await puppeteer.launch();
   
    const page = await browser.newPage();
   
    // Configure headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    // Font details to be returned
    let fontDetails = null;

    // Font interception logic
    page.on("response", async (response) => {
      try {
        const url = response.url();
        if (!isFirstFontProcessed && !fontDetails && url.match(/\.(woff2|woff|ttf|otf)$/i)) {
          isFirstFontProcessed = true; // Set the flag to true after processing first font
          
          // Download font
          const fontBuffer = await response.buffer();
         
          // Create app-specific folder
          const fontsDir = path.join("src", "utils" ,"fonts", appName);
          if (!fs.existsSync(fontsDir)) {
            fs.mkdirSync(fontsDir, { recursive: true });
          }

          // Generate filename and save path
          const fileName = `${appName}_${path.basename(url)}`;
          const filePath = path.join(fontsDir, fileName);
         
          // Save font file
          fs.writeFileSync(filePath, fontBuffer);
          console.log(`Font saved to: ${filePath}`);

          // Generate CSS
          const fontFormat = getFontFormat(fileName);
          const fontFamily = `${appName}-font`;
          
          // Convert font to base64
          const base64Font = convertFontToBase64(filePath);
          
          // Set font details to be returned
          fontDetails = {
            fontPath: base64Font,
            fontFamily: fontFamily,
            format: fontFormat,
          };

          // Schedule folder deletion (20 minutes)
          setTimeout(() => {
            if (fs.existsSync(fontsDir)) {
              fs.rmSync(fontsDir, { recursive: true, force: true });
              console.log(`Deleted folder: ${fontsDir}`);
            }
          }, 20 * 60 * 1000);
        }
      } catch (error) {
        console.error("Error processing font:", error.message);
      }
    });

    // Navigate to target page
    await page.goto(websiteUrl, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Wait a bit to ensure font interception
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return fontDetails;
  } catch (error) {
    console.error("Error in fetchAndSaveFont:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}