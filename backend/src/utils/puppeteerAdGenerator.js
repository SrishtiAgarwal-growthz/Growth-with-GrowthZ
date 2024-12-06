import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { launch } from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createAd(options = {}) {
    const {
        logoUrl, // URL of the logo
        mainImageUrl, // URL of the main image
        fontFamily,
        fontUrl,
        phrase, // Text content for the ad
        outputDir, // Directory to save the generated ad
        adDimensions = { width: 160, height: 600 }, // Ad dimensions
        fontSize = 14, // Font size for the phrase
        textColor = "#000", // Text color
        bgColor, // Background color
        logoDimensions = { width: 50, height: 50 }, // Logo dimensions
    } = options;

    try {
        // Ensure the output directory exists
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const browser = await launch({
            headless: true,
            args: ["--disable-web-security"],
        });
        const page = await browser.newPage();

        // Inject the html2canvas script
        const html2canvasPath = path.resolve(__dirname, "html2canvas.min.js");
        if (!fs.existsSync(html2canvasPath)) {
            throw new Error(
                "html2canvas.min.js file is missing. Ensure it is placed in the correct location."
            );
        }
        await page.addScriptTag({ path: html2canvasPath });

        // Font-face rule (include only if fontUrl is provided)
        const fontFaceRule = fontUrl ? `@font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
        }` : "";

        // Set HTML content dynamically
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
            <style>
            ${fontFaceRule}
            body {
              margin: 0;
              padding: 0;
              background: ${bgColor};
              font-family: '${fontFamily}';
              }
              .ad-container {
              width: ${adDimensions.width}px;
              height: ${adDimensions.height}px;
              background: ${bgColor};
              position: relative;
              font-family: '${fontFamily}';
              overflow: hidden;
              }
              .logo {
              position: absolute;
              top: 22px;
              right: 10px;
              width: ${logoDimensions.width}px;
              height: ${logoDimensions.height}px;
              object-fit: contain;
              }
              .text-content {
              position: absolute;
              top: 122px;
              width: 100%;
              text-align: center;
              font-size: ${fontSize}px;
              color: ${textColor};
              padding: 0 10px;
              box-sizing: border-box;
              line-height: 1.2;
              font-family: '${fontFamily}';
              }
              .main-image {
              position: absolute;
              top: 260px;
              left: 50%;
              transform: translateX(-50%);
              width: 100%;
              height: auto;
              max-height: 250px;
              object-fit: contain;
              }
              </style>
              </head>
              <body>
              <div class="ad-container">
              <img class="logo" src="${logoUrl}" alt="Logo">
              <div class="text-content">${phrase}</div>
              <img class="main-image" src="${mainImageUrl}" alt="Main Image">
              </div>
            </body>
        </html>
    `);


        // Wait for images to load
        await page.evaluate(async () => {
            const images = document.querySelectorAll("img");
            await Promise.all(
                Array.from(images).map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                })
            );
        });

        // Capture the ad as an image
        const adBuffer = await page.evaluate(async () => {
            const element = document.querySelector(".ad-container");
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            return canvas.toDataURL("image/png").split(",")[1];
        });

        const filename = `ad-${Date.now()}.png`;
        const filePath = join(outputDir, filename);
        writeFileSync(filePath, Buffer.from(adBuffer, "base64"));

        console.log(`Ad image generated at: ${filePath}`);
        await browser.close();

        return filePath;
    } catch (error) {
        console.error("Error creating ad:", error);
        throw error;
    }
}
