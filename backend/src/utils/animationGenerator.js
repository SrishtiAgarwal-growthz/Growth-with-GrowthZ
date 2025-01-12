/*******************************************************
 * animationGenerator.js
 *
 * Usage:
 *   import { createAnimations } from "./animationGenerator.js";
 *   const gifPath = await createAnimations({
 *       adDimensions: { width: 1080, height: 1080 },
 *       phrase: "Your ad text here...",
 *       logoUrl: "...",
 *       mainImageUrl: "...",
 *       bgColor: "#111111",
 *       textColor: "#FFFFFF",
 *       fontPath: null,
 *       fontName: "Inter",
 *       outputDir: "./animations/1080x1080",
 *       // optional CTA fields, etc.
 *   });
 *******************************************************/

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import GIFEncoder from "gif-encoder-2";
import pngJs from "png-js";
const { load } = pngJs;

// IMPORTANT: Make sure this path points to your own animationTemplates.js
import { animationTemplates } from "./animationTemplates.js";
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * createAnimations:
 * - Takes an `options` object describing which template to use, phrase, etc.
 * - Renders the HTML via Puppeteer, captures frames, and encodes them into a GIF.
 * - Returns the local path to the generated GIF file.
 */
export async function createAnimations(options = {}) {
  const { width, height } = options.adDimensions;
  const sizeKey = `${width}x${height}`;

  // 1) Get the correct template function from your animationTemplates
  const templateFn = animationTemplates[sizeKey];
  if (!templateFn) {
    throw new Error(`animationTemplates is missing a key for: ${sizeKey}`);
  }

  // 2) Build the HTML string
  const htmlContent = templateFn(options);

  // 3) Launch Puppeteer
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: options.adDimensions.width,
      height: options.adDimensions.height,
      deviceScaleFactor: 2, // Increase rendering resolution
    },
  });
  const page = await browser.newPage();

  // 4) Optionally create an output directory for frames if you want to keep them
  const framesDir = path.join(process.cwd(), "temp_frames");
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir);
  }

  const frameCount = 45; // Reduced from 60 to 45 for better file size
  const delayTime = 40; // Slightly slower animation for smoother appearance

  await page.setContent(htmlContent);
  await page.evaluate(() => document.fonts.ready);
  await delay(100);

  const encoder = new GIFEncoder(
    options.adDimensions.width * 2, // Double size for downscaling
    options.adDimensions.height * 2
  );
  encoder.setDelay(delayTime);
  encoder.setQuality(1); // Highest quality
  encoder.setRepeat(-1);
  encoder.start();
  // 5) Set the browser viewport
  const animationDuration = 2500;
  const timePerFrame = animationDuration / frameCount;

  for (let i = 0; i < frameCount; i++) {
    const currentTime = i * timePerFrame;

    await page.evaluate((time) => {
      document.getAnimations().forEach((animation) => {
        animation.currentTime = time;
      });
    }, currentTime);

    // Screenshot & store a temp .png for that frame
    const framePath = path.join(framesDir, `frame-${i}.png`);
    await page.screenshot({ path: framePath });

    // Convert the PNG to raw pixel data for GIF encoding
    const png = load(framePath);
    const pixels = await new Promise((resolve) => {
      png.decode((pixels) => resolve(pixels));
    });

    encoder.addFrame(pixels);
    console.log(`Frame ${i + 1}/${frameCount} captured.`);
  }

  // 9) Finalize the GIF
  await browser.close();
  encoder.finish();

  // 10) Write the GIF to disk
  // You can store or return this path or upload to S3, etc.
  const gifFilename = `animation_${Date.now()}.gif`;
  const gifPath = path.join(options.outputDir || process.cwd(), gifFilename);
  fs.writeFileSync(gifPath, encoder.out.getData());

  console.log(`[createAnimations] GIF saved to: ${gifPath}`);

  // Clean up the frames dir
  fs.readdirSync(framesDir).forEach((file) => {
    fs.unlinkSync(path.join(framesDir, file));
  });
  fs.rmdirSync(framesDir);

  await browser.close();
  return gifPath;
}
