import puppeteer from "puppeteer";
import path from "path";
import { adTemplates } from "./adTemplates.js";

export async function createAd(options = {}) {
  const {
    logoUrl,
    mainImageUrl,
    phrase,
    outputDir,
    bgColor,
    adDimensions = { width: 160, height: 600 },
    textColor,
    ctaText = "ORDER NOW",
    ctaColor,
    ctaTextColor,
    fontName,
    fontPath,
  } = options;

  const sizeKey = `${adDimensions.width}x${adDimensions.height}`;
  let browser;

  try {
    console.log(`[createAd] Starting ad creation for size: ${sizeKey}`);
    console.log("[createAd] Ad options received:", options);

    // Fetch the HTML template for the given size
    const generateHtml = adTemplates[sizeKey];
    if (!generateHtml) {
      throw new Error(`[createAd] No template found for dimensions: ${sizeKey}`);
    }

    // Generate HTML using the template function
    const html = generateHtml({
      logoUrl,
      mainImageUrl,
      phrase,
      bgColor,
      textColor,
      ctaText,
      ctaColor,
      ctaTextColor,
      fontName,
      fontPath,
      adDimensions,
    });

    console.log("[createAd] HTML content generated successfully.");

    // Launch Puppeteer
    console.log("[createAd] Launching Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
      timeout: 15000,
    });

    // Wait for fonts and images to load
    console.log("[createAd] Waiting for content to load...");
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.ready,
        ...Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", reject);
          });
        }),
      ]);
    });

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
