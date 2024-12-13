import axios from "axios";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function createAd(options = {}) {
  const {
    logoUrl,
    mainImageUrl,
    phrase,
    outputDir,
    bgColor,
    adDimensions = { width: 160, height: 600 },
    textColor,
    ctaText = 'ORDER NOW',
    ctaColor,
    ctaTextColor,
    fontName
  } = options;

  let browser;
  try {
    console.log('[createAd] Starting ad creation with phrase:', phrase);
    const processedPhrase = processAdText(phrase);
    console.log('[createAd] Processed phrase:', processedPhrase);

  
    // Font handling section
    let fontFaceRule = '';
    const fontDir = path.join(process.cwd(), 'font');
    let fontPath = '';

    const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    for (const ext of fontExtensions) {
        const testPath = path.join(fontDir, `${fontName}${ext}`);
        if (fs.existsSync(testPath)) {
            fontPath = testPath;
            break;
        }
    }
    console.log(fontPath ? `Font path found: ${fontPath}` : 'No font path found. Using fallback font.');
    console.log(`Using font: ${fontPath ? fontName : 'Inter (Fallback)'}`);
      // Read font file and convert to base64
      // const fontData = fs.readFileSync(fontPath);
      // const base64Font = fontData.toString('base64');
      
      fontFaceRule = `
        @font-face {
          font-family: '${fontName}';
         src: url('${fontPath}');
        }
      `;
      
      console.log(`[createAd] Font loaded: ${fontName}`);
    
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
        ${fontFaceRule}

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
            box-sizing: border-box;
            padding: 2px; 
          }

          .logo-container {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            z-index: 2;
            background-color: transparent;
            padding: 2px;
            border-radius: 4px;
          }

          .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .text-section {
            width: 100%;
            font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
            padding: 64px 15px 20px 15px;
            min-height: 160px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
          }

          .text-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .main-text {
            color: ${textColor};
            font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
            font-weight: 600;
            margin: 0;
            padding: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            text-align: left;
            font-size: 20px;
            line-height: 1.3;
          }

          .secondary-text {
            color: ${textColor};
            font-family: ${fontPath ? `'${fontName}'` : 'Inter'};
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            opacity: 0.85;
            font-weight: 400;
          }

          .main-image-container {
            flex: 1;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            margin: 5px 0;
            padding: 0 5px;
            box-sizing: border-box;
          }

          .main-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .cta-container {
            padding: 15px;
            margin-top: auto;
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="ad-container">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Logo" class="logo">
          </div>
          <div class="text-section">
            <div id="textContainer" class="text-container"></div>
          </div>
          <div class="main-image-container">
            <img src="${mainImageUrl}" alt="Main Image" class="main-image">
          </div>
          <div class="cta-container">
            <button class="cta-button">${ctaText}</button>
          </div>
        </div>
        <script>
          function formatText() {
            const text = ${JSON.stringify(processedPhrase)};
            const container = document.getElementById('textContainer');
            
            if (!container) {
              console.error('Text container not found');
              return;
            }

            console.log('Original text:', text);
            
            // Split text at punctuation marks
            const segments = text.split(/([.?!:])/).filter(Boolean);
            let formattedSegments = [];
            
            // Process segments and preserve punctuation
            for (let i = 0; i < segments.length; i++) {
              let segment = segments[i].trim();
              if (/^[.?!:]$/.test(segment)) {
                if (formattedSegments.length > 0) {
                  formattedSegments[formattedSegments.length - 1] += segment;
                }
              } else {
                formattedSegments.push(segment);
              }
            }

            console.log('Formatted segments:', formattedSegments);

            // Create text blocks based on segments
            if (formattedSegments.length > 1) {
              const midpoint = Math.ceil(formattedSegments.length / 2);
              const mainPart = formattedSegments.slice(0, midpoint).join(' ');
              const secondaryPart = formattedSegments.slice(midpoint).join(' ');

              console.log('Split text into parts:', { main: mainPart, secondary: secondaryPart });
              
              container.innerHTML = \`
                <p class="main-text">\${mainPart}</p>
                <p class="secondary-text">\${secondaryPart}</p>
              \`;
            } else {
              console.log('Using single text block');
              container.innerHTML = \`<p class="main-text">\${text}</p>\`;
            }
          }

          formatText();
        </script>
      </body>
    </html>`;

    console.log('[createAd] Launching browser...');
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('[createAd] Setting viewport...');
    await page.setViewport({
      width: adDimensions.width,
      height: adDimensions.height,
      deviceScaleFactor: 2
    });

    console.log('[createAd] Setting page content...');
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 15000
    });

    page.on('console', msg => console.log('Browser console:', msg.text()));

    console.log('[createAd] Waiting for content and images...');
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.ready,
        console.log('Fonts loaded successfully.'),
        ...Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        })
      ]);
    });

    const filename = `ad-${Date.now()}.png`;
    const filePath = path.join(outputDir, filename);

    console.log('[createAd] Taking screenshot...');
    await page.screenshot({
      path: filePath,
      type: 'png'
    });

    console.log('[createAd] Ad created successfully at:', filePath);
    return filePath;
  } catch (error) {
    console.error('[createAd] Error:', error);
    throw error;
  } finally {
    if (browser) {
      console.log('[createAd] Closing browser...');
      await browser.close();
    }
  }
}

function processAdText(text) {
  console.log('[processAdText] Starting text processing');
  try {
    console.log('[processAdText] Original text:', text);
    let processedText = text;

    // Clean up text
    processedText = processedText
      .replace(/^\d+\.\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\.{2,}/g, '.')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();

    console.log('[processAdText] Processed text:', processedText);
    return processedText;
  } catch (error) {
    console.error('[processAdText] Error:', error);
    return text;
  }
}
