import axios from "axios";
import puppeteer from "puppeteer";
import { join } from "path";
// import { existsSync, mkdirSync, createWriteStream } from "fs";
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = join(__filename, "..");

// async function downloadAndSaveFont(fontUrl, fontFamily) {
//   try {
//     // Create fonts directory if it doesn't exist
//     const fontsDir = join(__dirname, 'utils', 'fonts');
//     if (!existsSync(fontsDir)) {
//       mkdirSync(fontsDir, { recursive: true });
//     }

//     // Generate safe filename from fontFamily
//     const safeFontName = fontFamily.replace(/[^a-z0-9]/gi, '-').toLowerCase();
//     const fontPath = join(fontsDir, `${safeFontName}.woff2`);

//     // Check if font already exists
//     if (existsSync(fontPath)) {
//       console.log(`[downloadAndSaveFont] Font already exists: ${fontPath}`);
//       return fontPath;
//     }

//     // Download the font
//     console.log(`[downloadAndSaveFont] Downloading font from: ${fontUrl}`);
//     const response = await axios({
//       url: fontUrl,
//       method: 'GET',
//       responseType: 'stream'
//     });

//     // Save the font file
//     const writer = createWriteStream(fontPath);
//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on('finish', resolve);
//       writer.on('error', reject);
//     });

//     console.log(`[downloadAndSaveFont] Font saved successfully: ${fontPath}`);
//     return fontPath;
//   } catch (error) {
//     console.error(`[downloadAndSaveFont] Error: ${error.message}`);
//     throw error;
//   }
// }

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

      // Split into sentences and clean them
      const sentences = processedText
          .split(/(?<=\.)\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);

      // For multiple sentences, analyze and style
      if (sentences.length > 1) {
          // Process each sentence
          return sentences.map(sentence => {
              const wordCount = sentence.split(/\s+/).length;
              const isCTA = /\b(get|order|try|start|download|subscribe|join)\b/i.test(sentence);
              
              // Highlight if it's a CTA or short sentence
              if (isCTA || wordCount <= 4) {
                  return `<span style="color: #FFFFFF; font-weight: 800;">${sentence}</span>`;
              }
              return sentence;
          }).join('<br>');
      }

      // Return single sentences as is
      return processedText.trim();

  } catch (error) {
      console.error('[processAdText] Error:', error);
      return text;
  }
}

export async function createAd(options = {}) {
  const {
    logoUrl,
    mainImageUrl,
    fontFamily,
    fontUrl,
    phrase,
    outputDir,
    bgColor,
    adDimensions = { width: 160, height: 600 },
    ctaText = 'ORDER NOW',
    ctaColor,
    ctaTextColor = '#FFFFFF'
  } = options;

  let browser;
  try {
    // // Ensure output directory exists
    // if (!existsSync(outputDir)) {
    //   mkdirSync(outputDir, { recursive: true });
    // }

    // // Download and setup font if URL is provided
    // let fontFaceRule = '';
    // if (fontUrl && fontFamily) {
    //   try {
    //     const fontPath = await downloadAndSaveFont(fontUrl, fontFamily);
    //     fontFaceRule = `
    //       @font-face {
    //         font-family: '${fontFamily}';
    //         src: url('file://${fontPath.replace(/\\/g, '/')}') format('woff2');
    //         font-weight: normal;
    //         font-style: normal;
    //         font-display: swap;
    //       }
    //     `;
    //   } catch (error) {
    //     console.error(`[createAd] Font download error: ${error.message}`);
    //   }
    // }

    const processedPhrase = processAdText(phrase);

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
        
          body {
            margin: 0;
            padding: 0;
            width: ${adDimensions.width}px;
            height: ${adDimensions.height}px;
            overflow: hidden;
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
            top: 10px;
            right: 10px;
            width: 25px;
            height: 25px;
            z-index: 2;
          }

          .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .text-container {
            width: 100%;
            padding: 45px 10px 15px 10px;
            box-sizing: border-box;
            min-height: 100px;
          }

          .ad-text {
            font-size: 19px;
            text-align: left;
            line-height: 1.4;
            color: #89CFF0;
            font-weight: 600;
            margin: 0;
            padding-right: 15px;
          }

          .ad-text br {
            display: block;
            margin: 8px 0;
            content: "";
          }

          .main-image-container {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px 0;
            margin-bottom: 10px;
          }

          .main-image {
            width: 100%;
            max-height: 500px;
            object-fit: contain;
          }

          .cta-container {
            width: 100%;
            padding: 0 0 15px 0;
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

          .trust-badge {
            font-size: 11px;
            color: #666;
            text-align: center;
            margin: 8px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }

          .trust-badge svg {
            width: 12px;
            height: 12px;
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
            <div class="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Secure Application
            </div>
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