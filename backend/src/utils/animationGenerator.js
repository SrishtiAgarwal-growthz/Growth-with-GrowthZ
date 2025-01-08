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
    headless: true, 
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // 4) Optionally create an output directory for frames if you want to keep them
  const framesDir = path.join(process.cwd(), "temp_frames");
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir);
  }

  // 5) Set the browser viewport
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
  });

  // 6) Load the HTML content
  await page.setContent(htmlContent, { waitUntil: ["domcontentloaded"] });

  // Allow time for JS in the template to run (e.g., formatText()) and for animations to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 7) Prepare our GIF encoder
  const totalFrames = 30;           // e.g. 30 frames => ~1 second if we set ~33ms delay
  const delayPerFrameMs = 33;       // about 30 FPS
  const encoder = new GIFEncoder(width, height);

  encoder.start();
  encoder.setRepeat(0); // 0 => loop forever
  encoder.setDelay(delayPerFrameMs);
  encoder.setQuality(10); // lower => better quality, bigger file

  // 8) Capture each frame
  for (let i = 0; i < totalFrames; i++) {
    const currentTime = i * delayPerFrameMs; 
    // Force CSS animations to the appropriate time
    await page.evaluate((time) => {
      document.getAnimations().forEach((anim) => {
        anim.currentTime = time;
      });
    }, currentTime);

    // Screenshot & store a temp .png for that frame
    const framePath = path.join(framesDir, `frame-${i}.png`);
    await page.screenshot({ path: framePath });

    // Convert the PNG to raw pixel data for GIF encoding
    const png = load(framePath);
    const pixels = await new Promise((resolve) => {
      png.decode((decoded) => resolve(decoded));
    });

    encoder.addFrame(pixels);
    console.log(`Frame ${i + 1}/${totalFrames} captured.`);
  }

  // 9) Finalize the GIF
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
