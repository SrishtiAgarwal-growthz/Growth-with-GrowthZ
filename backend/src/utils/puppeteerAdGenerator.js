import axios from "axios";
import puppeteer from "puppeteer";
import { join } from "path";

/**
 * Download and save the font file locally.
 * @param {string} fontUrl - The URL of the font file.
 * @param {string} fontFamily - The font family name.
 * @returns {string} - The local file path of the saved font.
 */
async function downloadFont(fontUrl, fontFamily) {
  const extension = extname(fontUrl).split("?")[0] || ".woff2";
  const safeFontName = fontFamily.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const fontFileName = `${safeFontName}${extension}`;
  const fontPath = join(fontsDir, fontFileName);

  if (existsSync(fontPath)) {
    console.log(`[downloadFont] Font already exists: ${fontPath}`);
    return fontPath;
  }

  console.log(`[downloadFont] Downloading font from: ${fontUrl}`);
  const response = await axios.get(fontUrl, { responseType: "arraybuffer" });
  writeFileSync(fontPath, response.data);
  console.log(`[downloadFont] Font saved successfully: ${fontPath}`);

  return fontPath;
}

function processAdText(text) {
  try {
    let processedText = text;

    // Basic cleanup
    processedText = processedText
      .replace(/^\d+\.\s*/, '')        // Remove numbering
      .replace(/\*+/g, '')             // Remove asterisks
      .replace(/\s*\([^)]*\)/g, '')    // Remove parenthetical text
      .replace(/\s+/g, ' ')            // Normalize spaces
      .replace(/\.{2,}/g, '.')         // Fix multiple dots
      .replace(/[""]/g, '"')           // Normalize quotes
      .replace(/['']/g, "'");          // Normalize apostrophes

    // Handle colon in text
    const colonParts = processedText.split(':');
    if (colonParts.length > 1 && colonParts[1].trim().length > 0) {
      processedText = colonParts[1];
    }

    // Split into sentences using both . and ? as delimiters
    const sentences = processedText
      .split(/(?<=[.?])\s+/)           // Split after . or ?
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // For multiple sentences, apply different styles
    if (sentences.length > 1) {
      return sentences.map((sentence, index) => {
        const wordCount = sentence.split(/\s+/).length;
        const isCTA = /\b(get|order|try|start|download|subscribe|join)\b/i.test(sentence);

        // First sentence gets larger font size
        if (index === 0) {
          return `<div style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">${sentence}</div>`;
        }
        // Second sentence gets smaller font size
        return `<div style="font-size: 16px;">${sentence}</div>`;
      }).join('');
    }

    // Return single sentences as is, with the larger font size
    return `<div style="font-size: 22px;">${processedText.trim()}</div>`;

  } catch (error) {
    console.error('[processAdText] Error:', error);
    return text;
  }
}

export async function createAd(options = {}) {
  const {
    logoUrl,
    mainImageUrl,
    fontFamily = 'system-ui, -apple-system, sans-serif',
    fontUrl,
    phrase,
    outputDir,
    bgColor,
    adDimensions = { width: 160, height: 600 },
    fontSize,
    textColor,
    ctaText = 'ORDER NOW',
    ctaColor,
    ctaTextColor,
  } = options;

  let browser;
  try {
    // Process font with fallback handling
    const { fontPath, fontFamily: resolvedFontFamily } = await fontHandler.downloadAndSaveFont(
      fontUrl === 'Not present' ? null : fontUrl,
      fontFamily
    );

    const processedPhrase = processAdText(phrase);

    // Construct font-face CSS only if we have a custom font
    const fontFaceCSS = fontPath ? `
      @font-face {
        font-family: '${resolvedFontFamily}';
        src: url('file://${fontPath.replace(/\\/g, "/")}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    ` : '';

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
        ${fontFaceCSS}

          body {
            margin: 0;
            padding: 0;
            width: ${adDimensions.width}px;
            height: ${adDimensions.height}px;
            overflow: hidden;
            font-family: ${resolvedFontFamily}, system-ui, -apple-system, sans-serif;
          }

          .ad-container {
            width: 100%;
            height: 100%;
            background-color: ${bgColor};
            display: flex;
            flex-direction: column;
            position: relative;
            font-family: '${fontFamily}', system-ui, -apple-system, sans-serif;
            box-sizing: border-box;
            padding: 10px;
          }

          .logo-container {
            position: absolute;
            top: 7px;
            right: 7px;
            width: 40px;
            height: 40px;
            z-index: 2;
            padding: 3px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }

          .text-container {
            width: 100%;
            height: 180px; /* Fixed height for text section */
            padding: 45px 10px 0 10px;
            box-sizing: border-box;
            margin-bottom: 15px;
          }

          .ad-text {
            text-align: left;
            line-height: 1.4;
            color: ${textColor};
            font-weight: 600;
            margin: 0;
            padding-right: 10px;
          }

          .ad-text br {
            display: block;
            margin: 8px 0;
            content: "";
          }

          .ad-text div {
            margin-bottom: 8px;
          }
          
          .ad-text div:last-child {
            margin-bottom: 0;
          }

          .main-image-container {
            width: 100%;
            height: 550px; /* Fixed height for image section */
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;
            overflow: hidden;
          }

          .main-image {
            width: 100%;
            height: 100%;
            object-fit: contain; /* Maintains aspect ratio */
          }

          .cta-container {
            width: 100%;
            padding: 0 0 10px 0;
            margin-top: auto; /* Pushes button to bottom */
            box-sizing: border-box;
          }

          .cta-button {
            width: 100%;
            height: 44px;
            background: ${ctaColor};
            color: ${ctaTextColor};
            border: none;
            border-radius: 8px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
            font-size: 16px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="ad-container">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Logo" class="logo">
          </div>
          <div class="text-container">
            <div class="ad-text">${processedPhrase}</div>
          </div>
          <div class="main-image-container">
            <img src="${mainImageUrl}" alt="Main Image" class="main-image">
          </div>
          <div class="cta-container">
            <button class="cta-button">${ctaText}</button>
          </div>
        </div>
      </body>
    </html>
  `;

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: adDimensions.width,
      height: adDimensions.height,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    await page.evaluate(async () => {
      await Promise.all([
        ...Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        }),
        document.fonts.ready
      ]);
    });

    const filename = `ad-${Date.now()}.png`;
    const filePath = join(outputDir, filename);

    await page.screenshot({
      path: filePath,
      type: 'png'
    });

    return filePath;
  } catch (error) {
    console.error('[createAd] Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}