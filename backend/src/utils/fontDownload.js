import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const sanitizeName = (name) => {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .trim();
};

// Initialize puppeteer with stealth plugin
puppeteer.use(StealthPlugin());

const getFontFormat = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const formatMap = {
    woff2: "woff2",
    woff: "woff",
    ttf: "truetype",
    otf: "opentype",
  };
  return formatMap[ext] || "ttf";
};

const convertFontToBase64 = (fontPath) => {
  const fontBuffer = fs.readFileSync(fontPath);
  const base64Font = fontBuffer.toString('base64');
  const format = path.extname(fontPath).toLowerCase().replace('.', '');
  
  const mimeTypes = {
    'woff2': 'application/font-woff2',
    'woff':  'application/font-woff',
    'ttf':   'application/x-font-ttf',
    'otf':   'application/x-font-opentype'
  };
  
  const mimeType = mimeTypes[format] || 'font/ttf';
  return `data:${mimeType};base64,${base64Font}`;
};

const getFallbackFont = () => {
  try {
    // Assuming Inter.woff is in the fonts/Fallback directory
    const fallbackFontPath = path.join("src", "utils", "fonts", "Fallback", "Inter.ttf");
    
    if (!fs.existsSync(fallbackFontPath)) {
      throw new Error("Fallback font not found");
    }

    const base64Font = convertFontToBase64(fallbackFontPath);
    
    return {
      fontPath: base64Font,
      fontFamily: "Default",
      format: "ttf"
    };
  } catch (error) {
    console.error("Error loading fallback font:", error.message);
    throw error;
  }
};

export async function fetchFont(appName, websiteUrl) {
  let browser = null;
  appName = sanitizeName(appName);
  let isFirstFontProcessed = false;

  try {
    // Validate websiteUrl
    if (!websiteUrl || typeof websiteUrl !== 'string') {
      console.warn("Invalid website URL provided - using fallback font");
      return getFallbackFont();
    }

    browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    let fontDetails = null;

    page.on("response", async (response) => {
      try {
        const url = response.url();
        if (!isFirstFontProcessed && !fontDetails && url.match(/\.(woff2|woff|ttf|otf)$/i)) {
          isFirstFontProcessed = true;
          
          const fontBuffer = await response.buffer();
          const fontsDir = path.join("src", "utils", "fonts", appName);
          
          if (!fs.existsSync(fontsDir)) {
            fs.mkdirSync(fontsDir, { recursive: true });
          }

          const fileName = `${appName}_${path.basename(url)}`;
          const filePath = path.join(fontsDir, fileName);
          
          fs.writeFileSync(filePath, fontBuffer);
          console.log(`Font saved to: ${filePath}`);

          const fontFormat = getFontFormat(fileName);
          const fontFamily = `${appName}-font`;
          const base64Font = convertFontToBase64(filePath);
          
          fontDetails = {
            fontPath: base64Font,
            fontFamily: fontFamily,
            format: fontFormat,
          };

          setTimeout(() => {
            if (fs.existsSync(fontsDir)) {
              fs.rmSync(fontsDir, { recursive: true, force: true });
              console.log(`Deleted folder: ${fontsDir}`);
            }
          }, 20 * 60 * 1000);
        }
      } catch (error) {
        console.error("Error processing font:", error.message);
      }
    });

    await page.goto(websiteUrl, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // If no font was found or processed, use fallback
    if (!fontDetails) {
      console.warn("No font found - using fallback font");
      return getFallbackFont();
    }

    return fontDetails;
  } catch (error) {
    console.error("Error in fetchAndSaveFont:", error.message);
    console.warn("Using fallback font due to error");
    return getFallbackFont();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}