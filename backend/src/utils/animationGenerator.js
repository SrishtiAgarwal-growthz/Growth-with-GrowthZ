import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import GIFEncoder from "gif-encoder-2";
import pngJs from "png-js";
const { load } = pngJs;

// Import your animation templates
import { animationTemplates } from "./animationTemplates.js";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to ensure a directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[ensureDirectoryExists] Directory created: ${dir}`);
  }
}

// Function to handle 1080x1080 animations
async function createLargeAnimation(options, htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Ensure frames directory exists
  const framesDir = path.join(process.cwd(), "temp_frames");
  ensureDirectoryExists(framesDir);

  const frameCount = 60;
  const delayTime = 33;

  await page.setViewport({ width: options.adDimensions.width, height: options.adDimensions.height });
  await page.setContent(htmlContent);

  await page.evaluate(() => document.fonts.ready);
  await delay(100);

  const encoder = new GIFEncoder(options.adDimensions.width, options.adDimensions.height);
  encoder.setDelay(delayTime);
  encoder.setQuality(10);
  encoder.setRepeat(-1);
  encoder.start();

  const animationDuration = 2000;
  const timePerFrame = animationDuration / frameCount;

  for (let i = 0; i < frameCount; i++) {
    const currentTime = i * timePerFrame;

    await page.evaluate((time) => {
      document.getAnimations().forEach((animation) => {
        animation.currentTime = time;
      });
    }, currentTime);

    const framePath = path.join(framesDir, `frame-${i}.png`);
    await page.screenshot({ path: framePath });

    const png = load(framePath);
    const pixels = await new Promise((resolve) => {
      png.decode((pixels) => resolve(pixels));
    });

    encoder.addFrame(pixels);
    console.log(`Frame ${i + 1}/${frameCount} captured.`);
  }

  await browser.close();
  encoder.finish();

  const { gifPath } = await saveAndCleanup(options, encoder, framesDir);
  return gifPath;
}

// Function to handle 300x250 animations
async function createSmallAnimation(options, htmlContent) {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: options.adDimensions.width,
      height: options.adDimensions.height,
      deviceScaleFactor: 2,
    },
  });
  const page = await browser.newPage();

  // Ensure frames directory exists
  const framesDir = path.join(process.cwd(), "temp_frames");
  ensureDirectoryExists(framesDir);

  const frameCount = 45;
  const delayTime = 40;

  await page.setContent(htmlContent);
  await page.evaluate(() => document.fonts.ready);
  await delay(100);

  const encoder = new GIFEncoder(
    options.adDimensions.width * 2,
    options.adDimensions.height * 2
  );
  encoder.setDelay(delayTime);
  encoder.setQuality(1);
  encoder.setRepeat(-1);
  encoder.start();

  const animationDuration = 2500;
  const timePerFrame = animationDuration / frameCount;

  for (let i = 0; i < frameCount; i++) {
    const currentTime = i * timePerFrame;

    await page.evaluate((time) => {
      document.getAnimations().forEach((animation) => {
        animation.currentTime = time;
      });
    }, currentTime);

    const framePath = path.join(framesDir, `frame-${i}.png`);
    await page.screenshot({ path: framePath });

    const png = load(framePath);
    const pixels = await new Promise((resolve) => {
      png.decode((pixels) => resolve(pixels));
    });

    encoder.addFrame(pixels);
    console.log(`Frame ${i + 1}/${frameCount} captured.`);
  }

  await browser.close();
  encoder.finish();

  const { gifPath } = await saveAndCleanup(options, encoder, framesDir);
  return gifPath;
}

// Helper function for saving GIF and cleaning up frames
async function saveAndCleanup(options, encoder, framesDir) {
  const outputDir = options.outputDir || process.cwd();

  // Ensure output directory exists
  ensureDirectoryExists(outputDir);

  const gifFilename = `animation_${Date.now()}.gif`;
  const gifPath = path.join(outputDir, gifFilename);
  fs.writeFileSync(gifPath, encoder.out.getData());

  // Clean up the frames directory
  fs.readdirSync(framesDir).forEach((file) => {
    fs.unlinkSync(path.join(framesDir, file));
  });
  fs.rmdirSync(framesDir);

  return { gifPath, framesDir };
}

// Main function that determines which animation function to use
export async function createAnimations(options = {}) {
  const { width, height } = options.adDimensions;
  const sizeKey = `${width}x${height}`;

  const templateFn = animationTemplates[sizeKey];
  if (!templateFn) {
    throw new Error(`animationTemplates is missing a key for: ${sizeKey}`);
  }

  const htmlContent = templateFn(options);

  let gifPath;
  switch (sizeKey) {
    case "1080x1080":
      gifPath = await createLargeAnimation(options, htmlContent);
      break;
    case "300x250":
      gifPath = await createSmallAnimation(options, htmlContent);
      break;
    default:
      throw new Error(`Unsupported size: ${sizeKey}`);
  }

  console.log(`[createAnimations] GIF saved to: ${gifPath}`);
  return gifPath;
}
