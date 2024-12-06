import { launch } from "puppeteer";
import axios from "axios";
import { mkdirSync, createWriteStream, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, ".."); // Directory containing this file

/**
 * Utility function to get the fonts directory path inside `utils`
 */
function getFontsDirectory() {
  const fontsDir = join(__dirname, "fonts"); // Fonts folder inside `utils`
  if (!existsSync(fontsDir)) {
    mkdirSync(fontsDir, { recursive: true });
    console.log(`[getFontsDirectory] Created fonts directory at: ${fontsDir}`);
  }
  return fontsDir;
}

/**
 * Fetch the font URL from Google Fonts using the font name.
 * @param {string} fontName - The font name to search on Google Fonts.
 * @returns {Promise<string|null>} - The font file URL or null if not found.
 */
async function fetchGoogleFont(fontName) {
  try {
    console.log(`[fetchGoogleFont] Searching for "${fontName}" on Google Fonts...`);
    const googleFontsCssUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}`;
    const response = await axios.get(googleFontsCssUrl);

    // Extract font URL from CSS
    const fontUrlMatch = response.data.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontUrl = fontUrlMatch[1].replace(/['"]/g, "");
      console.log(`[fetchGoogleFont] Font found on Google Fonts: ${fontUrl}`);
      return fontUrl;
    }

    console.log(`[fetchGoogleFont] Font "${fontName}" not found on Google Fonts.`);
    return null;
  } catch (error) {
    console.error(`[fetchGoogleFont] Error searching for "${fontName}": ${error.message}`);
    return null;
  }
}

/**
 * Download fonts directly from the website by monitoring network requests.
 * @param {string} fontName - The font name to search for on the website.
 * @param {string} websiteUrl - The website URL to monitor for font requests.
 * @returns {Promise<string>} - The path to the downloaded font file.
 */
async function downloadFontFromWebsite(fontName, websiteUrl) {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  const fontRegex = fontName.toLowerCase() === "abc" ? null : new RegExp(fontName.replace(/\s+/g, ".*"), "i");
  const fontUrls = [];

  try {
    console.log(`[downloadFontFromWebsite] Opening website: ${websiteUrl}`);
    await page.goto(websiteUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await await new Promise((resolve) => setTimeout(resolve, 5000)); // Replace 5000 with your desired timeout in ms(5000); // Ensure all network requests are captured

    console.log(`[downloadFontFromWebsite] Monitoring network requests for font files...`);
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
      console.error(`[downloadFontFromWebsite] No font URLs found.`);
      throw new Error("No font URLs found.");
    }

    const tempDir = getFontsDirectory();
    const fontExtension = extname(fontUrls[0]).split("?")[0] || ".woff2";
    const filename = fontName.split(",")[0].trim().replace(/\s+/g, "_");
    const fontOutputPath = join(tempDir, `${filename}${fontExtension}`);

    console.log(`[downloadFontFromWebsite] Downloading font from: ${fontUrls[0]}`);
    const response = await axios({
      url: fontUrls[0],
      method: "GET",
      responseType: "stream",
    });

    const writer = createWriteStream(fontOutputPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`[downloadFontFromWebsite] Font downloaded successfully: ${fontOutputPath}`);
    return fontOutputPath;
  } catch (error) {
    console.error(`[downloadFontFromWebsite] Error: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Save the font to a temporary directory by downloading from Google Fonts or a website.
 * @param {string} fontName - The name of the font to download.
 * @param {string|null} websiteUrl - The website URL to fetch the font from (if not found on Google Fonts).
 * @returns {Promise<{fontName: string, fontPath: string}>} - The font name and its local path.
 */
export async function saveFontToTemp(fontName, websiteUrl = null) {
  const fontsDir = getFontsDirectory();

  try {
    if (fontName.toLowerCase() !== "abc") {
      console.log(`[saveFontToTemp] Checking Google Fonts for: "${fontName}"`);
      const googleFontUrl = await fetchGoogleFont(fontName);

      if (googleFontUrl) {
        const fontExtension = extname(googleFontUrl).split("?")[0] || ".woff2";
        const outputPath = join(fontsDir, `${fontName.replace(/\s+/g, "_")}${fontExtension}`);

        try {
          console.log(`[saveFontToTemp] Downloading font from Google Fonts: ${googleFontUrl}`);
          const response = await axios({
            url: googleFontUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = createWriteStream(outputPath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          console.log(`[saveFontToTemp] Font downloaded successfully from Google Fonts: ${outputPath}`);
          return { fontName, fontPath: outputPath };
        } catch (error) {
          console.error(`[saveFontToTemp] Failed to download font from Google Fonts: ${error.message}`);
        }
      }
    }

    if (websiteUrl) {
      console.log(`[saveFontToTemp] Google Fonts did not have "${fontName}". Attempting website extraction.`);
      const fontPath = await downloadFontFromWebsite(fontName, websiteUrl);
      return { fontName, fontPath };
    }

    throw new Error(`Font "${fontName}" not found on Google Fonts or website.`);
  } catch (error) {
    console.error(`[saveFontToTemp] Failed to save font "${fontName}": ${error.message}`);
    throw error;
  }
}

export default { saveFontToTemp };
