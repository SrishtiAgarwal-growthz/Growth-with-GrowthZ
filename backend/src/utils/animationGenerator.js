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

// Function to handle 1080x1080 animations
async function createLargeAnimation(options, htmlContent) {
  const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const framesDir = path.join(process.cwd(), "temp_frames");
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir);
    }
    // Increase frame count and decrease delay for smoother animation
    const frameCount = 60; // Doubled from 30 to 60
    const delayTime = 33; // ~30fps (1000ms / 30fps ≈ 33.33ms)
  
    await page.setViewport({ width: options.adDimensions.width, height: options.adDimensions.height });
    await page.setContent(htmlContent);
    
    // Wait for all animations to be ready
    await page.evaluate(() => document.fonts.ready);
    await delay(100); // Small delay to ensure everything is loaded
  
    const encoder = new GIFEncoder(options.adDimensions.width, options.adDimensions.height);
    encoder.setDelay(delayTime);
    encoder.setQuality(10); // Lower number = better quality
    encoder.setRepeat(-1);   // 0 = loop forever
    encoder.start();
  
    // Calculate total animation duration (1000ms = 1s animation duration from CSS)
    const animationDuration = 2000;
    const timePerFrame = animationDuration / frameCount;
  
    for (let i = 0; i < frameCount; i++) {
      // Calculate current animation time
      const currentTime = i * timePerFrame;
      
      // Set the animation time using CSS animations playState
      await page.evaluate((time) => {
        document.getAnimations().forEach(animation => {
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

  // Cleanup and return
  const { gifPath, framesDir: frames } = await saveAndCleanup(options, encoder, framesDir);
  return gifPath;
}

// Function to handle 300x250 animations
async function createSmallAnimation(options, htmlContent) {
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

  // Cleanup and return
  const { gifPath, framesDir: frames } = await saveAndCleanup(options, encoder, framesDir);
  return gifPath;
}

// Helper function for saving GIF and cleaning up frames
async function saveAndCleanup(options, encoder, framesDir) {
  const gifFilename = `animation_${Date.now()}.gif`;
  const gifPath = path.join(options.outputDir || process.cwd(), gifFilename);
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

  // Get the template function
  const templateFn = animationTemplates[sizeKey];
  if (!templateFn) {
    throw new Error(`animationTemplates is missing a key for: ${sizeKey}`);
  }

  // Build the HTML string
  const htmlContent = templateFn(options);

  // Choose the appropriate animation function based on size
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