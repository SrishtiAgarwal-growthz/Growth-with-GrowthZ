import { launch } from "puppeteer";
import axios from "axios";
import { join, extname } from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, ".."); // Directory containing this file

/**
 * Fetch the font URL from Google Fonts using the font family.
 * @param {string} fontFamily - The font family to search on Google Fonts.
 * @returns {Promise<string|null>} - The font file URL or null if not found.
 */
async function fetchGoogleFont(fontFamily) {
  try {
    console.log(`[fetchGoogleFont] Searching for "${fontFamily}" on Google Fonts...`);
    const googleFontsCssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}`;
    const response = await axios.get(googleFontsCssUrl);

    // Extract font URL from CSS
    const fontUrlMatch = response.data.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontUrl = fontUrlMatch[1].replace(/['"]/g, "");
      console.log(`[fetchGoogleFont] Font found on Google Fonts: ${fontUrl}`);
      return fontUrl;
    }

    console.log(`[fetchGoogleFont] Font "${fontFamily}" not found on Google Fonts.`);
    return null;
  } catch (error) {
    console.error(`[fetchGoogleFont] Error searching for "${fontFamily}": ${error.message}`);
    return null;
  }
}

/**
 * Extract the font URL directly from the website by monitoring network requests.
 * @param {string} fontFamily - The font family to search for on the website.
 * @param {string} websiteUrl - The website URL to monitor for font requests.
 * @returns {Promise<string>} - The font URL.
 */
async function extractFontUrlFromWebsite(fontFamily, websiteUrl) {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  const fontUrls = [];

  try {
    console.log(`[extractFontUrlFromWebsite] Opening website: ${websiteUrl}`);
    await page.goto(websiteUrl, { waitUntil: "networkidle2", timeout: 60000 });

    console.log(`[extractFontUrlFromWebsite] Monitoring network requests for font files...`);
    page.on("response", async (response) => {
      const requestUrl = response.url();
      const contentType = response.headers()["content-type"] || "";

      if (
        contentType.includes("font") ||
        requestUrl.endsWith(".woff") ||
        requestUrl.endsWith(".woff2") ||
        requestUrl.endsWith(".ttf") ||
        requestUrl.endsWith(".otf")
      ) {
        console.log(`[Font Response] URL: ${requestUrl}`);
        fontUrls.push(requestUrl);
      }
    });

    await page.reload({ waitUntil: "networkidle2" });

    if (fontUrls.length === 0) {
      console.error(`[extractFontUrlFromWebsite] No font URLs found.`);
      throw new Error("No font URLs found.");
    }

    console.log(`[extractFontUrlFromWebsite] Font URL extracted: ${fontUrls[0]}`);
    return fontUrls[0]; // Return the first detected font URL
  } catch (error) {
    console.error(`[extractFontUrlFromWebsite] Error: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Save the font family and URL to MongoDB by downloading from Google Fonts or extracting from a website.
 * @param {string} fontFamily - The name of the font to fetch.
 * @param {string|null} websiteUrl - The website URL to fetch the font from (if not found on Google Fonts).
 * @returns {Promise<{fontFamily: string, fontUrl: string}>} - The font family and its URL.
 */
export async function saveFontToTemp(fontFamily, websiteUrl = null) {
  try {
    if (fontFamily.toLowerCase() !== "abc") {
      console.log(`[saveFontToTemp] Checking Google Fonts for: "${fontFamily}"`);
      const googleFontUrl = await fetchGoogleFont(fontFamily);

      if (googleFontUrl) {
        console.log(`[saveFontToTemp] Found Google Font URL: ${googleFontUrl}`);
        return { fontFamily, fontUrl: googleFontUrl };
      }
    }

    if (websiteUrl) {
      console.log(`[saveFontToTemp] Google Fonts did not have "${fontFamily}". Attempting website extraction.`);
      const fontUrl = await extractFontUrlFromWebsite(fontFamily, websiteUrl);
      return { fontFamily, fontUrl };
    }

    throw new Error(`Font "${fontFamily}" not found on Google Fonts or website.`);
  } catch (error) {
    console.error(`[saveFontToTemp] Failed to retrieve font for "${fontFamily}": ${error.message}`);
    throw error;
  }
}

export default { saveFontToTemp };
