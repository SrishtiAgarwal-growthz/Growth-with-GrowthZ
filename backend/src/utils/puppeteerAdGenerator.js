import puppeteer from "puppeteer";
import path from "path";
import fs from "fs"; // Import fs module
import { adTemplates } from "./adTemplates.js";

export async function createAd(options = {}) {
  const {
    fontFamily,
    fontFormat,
    fontPath,
    adDimensions,
    bgColor,
    textColor,
    ctaColor,
    ctaTextColor,
    logoUrl,
    mainImageUrl,
    phrase,
    ctaText,
    outputDir,
  } = options;

  const sizeKey = `${adDimensions.width}x${adDimensions.height}`;
  let browser;

  try {
    console.log(`[createAd] Starting ad creation for size: ${sizeKey}`);
    console.log("[createAd] Ad options received:",options);

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      console.log(`[createAd] Output directory does not exist. Creating: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Fetch the HTML template for the given size
    const generateHtml = adTemplates[sizeKey];
    if (!generateHtml) {
      throw new Error(`[createAd] No template found for dimensions: ${sizeKey}`);
    }

    // Generate HTML using the template function
    const html = generateHtml({
      fontFamily,
    fontFormat,
    fontPath,
    adDimensions,
    bgColor,
    textColor,
    ctaColor,
    ctaTextColor,
    logoUrl,
    mainImageUrl,
    phrase,
    ctaText,
    });

    console.log("[createAd] HTML content generated successfully.");

    // Launch Puppeteer
    console.log("[createAd] Launching Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox",  "--font-render-hinting=none"],
    });

    const page = await browser.newPage();

    // Set the viewport
    console.log("[createAd] Setting viewport...");
    await page.setViewport({
      width: adDimensions.width,
      height: adDimensions.height,
      deviceScaleFactor: 2,
    });

    // Set the content
    console.log("[createAd] Setting HTML content...");
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30000,
    });

    // Wait for fonts and images to load
    console.log("[createAd] Waiting for content to load...");
    await page.evaluate(async () => {
      try {
        // Wait for fonts to load
        await document.fonts.ready;
        
        // Verify font loading
        const fontLoaded = document.fonts.check(`1em "${fontFamily}"`);
        console.log(`Font loading status for ${fontFamily}:`, fontLoaded);

        // Wait for images
        await Promise.all(
          Array.from(document.images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", reject);
            });
          })
        );
      } catch (error) {
        console.error("Error during content loading:", error);
        // Continue anyway to ensure the process doesn't hang
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture screenshot
    const filename = `ad-${sizeKey}-${Date.now()}.png`;
    const filePath = path.join(outputDir, filename);

    console.log("[createAd] Capturing screenshot...");
    await page.screenshot({
      path: filePath,
      type: "png",
    });

    console.log(`[createAd] Ad created successfully: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("[createAd] Error during ad creation:", error.message);
    throw error;
  } finally {
    if (browser) {
      console.log("[createAd] Closing Puppeteer browser...");
      await browser.close();
    }
  }
}
