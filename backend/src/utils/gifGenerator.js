// backend/src/utils/gifGenerator.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { launch } from "puppeteer";
import GIFEncoder from "gif-encoder-2";
import pkg from "png-js";
const { load } = pkg;
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync, rmdirSync } from "fs";
import { join } from "path";

// Re-use your existing animation templates:
import { animationTemplates } from "./animationTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Small helper for safe delays */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Renders HTML from your existing `animationTemplates.js`.
 * If you want to keep a separate template (like in your old script.js),
 * replace the below logic with your own version.
 */
function generateAdTemplate(options) {
  const { width, height } = options.adDimensions;
  const sizeKey = `${width}x${height}`;

  // Pull the correct template from `animationTemplates`
  const templateFn = animationTemplates[sizeKey];
  if (!templateFn) {
    throw new Error(`No template found for sizeKey: ${sizeKey}`);
  }

  // Build the HTML string
  return templateFn({
    logoUrl: options.logoUrl,
    mainImageUrl: options.mainImageUrl,
    phrase: options.phrase,
    bgColor: options.bgColor,
    textColor: options.textColor,
    ctaText: options.ctaText,
    ctaColor: options.ctaColor,
    ctaTextColor: options.ctaTextColor,
    adDimensions: options.adDimensions,
    fontName: options.fontName,
    fontPath: options.fontPath,
  });
}

/**
 * createGifFromAd(options):
 * 1) Generate HTML from template
 * 2) Launch Puppeteer
 * 3) Capture frames over time
 * 4) Encode frames into a GIF
 * 5) Return local path to the GIF
 */
export async function createGifFromAd(options) {
  // 1) Generate the HTML
  const htmlContent = generateAdTemplate(options);

  // 2) Launch Puppeteer
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // 3) Ensure output directory exists
  const outDir = options.outputDir || path.join(process.cwd(), "animations");
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // 4) Create a temporary folder for frames
  const framesDir = join(outDir, "frames");
  if (!existsSync(framesDir)) {
    mkdirSync(framesDir);
  }

  // 5) Configure GIF settings
  const frameCount = 60;    // e.g. 60 frames
  const delayTime = 33;     // ~30fps => 33ms
  const animationDuration = 1000; // ~1s of CSS animation
  const timePerFrame = animationDuration / frameCount;

  // 6) Load the HTML into Puppeteer
  await page.setViewport({
    width: options.adDimensions.width,
    height: options.adDimensions.height,
    deviceScaleFactor: 1,
  });

  await page.setContent(htmlContent, { waitUntil: ["domcontentloaded", "networkidle0"] });
  // Wait for fonts, images
  await page.evaluate(() => document.fonts.ready);
  await delay(100);

  // 7) Create the GIF encoder
  const encoder = new GIFEncoder(options.adDimensions.width, options.adDimensions.height);
  encoder.setDelay(delayTime);
  encoder.setQuality(10);
  encoder.setRepeat(0); // loop forever
  encoder.start();

  // 8) Capture frames
  for (let i = 0; i < frameCount; i++) {
    const currentTime = i * timePerFrame;

    // Force CSS animations to the currentTime
    await page.evaluate((time) => {
      document.getAnimations().forEach((anim) => {
        anim.currentTime = time;
      });
    }, currentTime);

    const framePath = join(framesDir, `frame-${i}.png`);
    await page.screenshot({ path: framePath });

    // Load the PNG data
    const png = load(framePath);
    const pixels = await new Promise((resolve) => {
      png.decode((decodedPixels) => resolve(decodedPixels));
    });

    // Add the frame to the GIF
    encoder.addFrame(pixels);
    console.log(`Processed frame ${i + 1}/${frameCount}`);
  }

  // 9) Finalize the GIF
  await browser.close();
  encoder.finish();

  // 10) Save it to disk
  const gifFilename = `animated-ad-${Date.now()}.gif`;
  const gifPath = join(outDir, gifFilename);
  writeFileSync(gifPath, encoder.out.getData());
  console.log(`GIF created successfully: ${gifPath}`);

  // 11) Clean up frames
  readdirSync(framesDir).forEach((file) => unlinkSync(join(framesDir, file)));
  rmdirSync(framesDir);

  return gifPath;
}
