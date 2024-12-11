import { launch } from 'puppeteer';
import axios from 'axios';
import { mkdirSync, createWriteStream } from 'fs';
import { join, extname } from 'path';

async function fetchGoogleFont(fontName) {
    try {
        const googleFontsCssUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}`;
        const response = await axios.get(googleFontsCssUrl);
        const fontUrlMatch = response.data.match(/url\(([^)]+)\)/);
        if (fontUrlMatch) {
            const fontUrl = fontUrlMatch[1].replace(/['"]/g, '');
            console.log(`Google Fonts URL found: ${fontUrl}`);
            return fontUrl;
        }
        console.log(`Font "${fontName}" not found on Google Fonts.`);
        return null;
    } catch (error) {
        console.log(`Font "${fontName}" not found on Google Fonts.`);
        return null;
    }
}

async function downloadFontFromWebsite(fontName, websiteUrl) {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    const fontRegex = fontName.toLowerCase() === 'abc' ? null : new RegExp(fontName.replace(/\s+/g, '.*'), 'i');
    const fontUrls = [];

    try {
        console.log(`Opening the website: ${websiteUrl}`);
        await page.goto(websiteUrl, { waitUntil: 'networkidle2' });

        console.log('Monitoring network requests for font files...');
        page.on('response', async (response) => {
            const requestUrl = response.url();
            const contentType = response.headers()["content-type"] || "";
            if (
              contentType.includes("font") ||
              requestUrl.endsWith('.woff') || 
              requestUrl.endsWith('.woff2') || 
              requestUrl.endsWith('.ttf') || 
              requestUrl.endsWith('.otf')
            ) {
                if (fontName.toLowerCase() === 'abc' || fontRegex.test(requestUrl)) {
                    console.log(`Font URL found: ${requestUrl}`);
                    fontUrls.push(requestUrl);
                }
            }
        });

        await page.reload({ waitUntil: 'networkidle2' });

        if (fontUrls.length === 0) {
            console.log(`No fonts found on the website.`);
            throw new Error('No font URLs found.');
        }

        const urlsToTry = fontName.toLowerCase() === 'abc' ? [fontUrls[0]] : fontUrls;
        const tempDir = join(process.cwd(), 'src', 'utils', 'fonts');
        mkdirSync(tempDir, { recursive: true });

        for (const fontUrl of urlsToTry) {
            try {
                console.log(`Attempting to download font from: ${fontUrl}`);
                const fontExtension = extname(fontUrl).split('?')[0] || '.woff2';
                const filename = fontName.toLowerCase() === 'abc' ? 'downloaded_font' : fontName;
                const fontOutputPath = join(tempDir, `${filename}${fontExtension}`);

                const response = await axios({
                    url: fontUrl,
                    method: 'GET',
                    responseType: 'stream',
                });

                const writer = createWriteStream(fontOutputPath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                console.log(`Font downloaded successfully: ${fontOutputPath}`);
                return { fontPath: fontOutputPath, fontUrl };
            } catch (downloadError) {
                console.error(`Failed to download font from ${fontUrl}: ${downloadError.message}`);
            }
        }

        throw new Error('Failed to download any of the found font URLs.');
    } catch (error) {
        console.error('Error during font extraction or download:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

export async function saveFontToTemp(fontName, websiteUrl = null) {
  const targetDir = join(process.cwd(), 'src', 'utils', 'fonts');
  mkdirSync(targetDir, { recursive: true }); // Ensure the directory exists

    try {
        if (fontName.toLowerCase() !== 'abc') {
            console.log(`Attempting to fetch "${fontName}" from Google Fonts...`);
            const googleFontUrl = await fetchGoogleFont(fontName);

            if (googleFontUrl) {
                const fontExtension = extname(googleFontUrl).split('?')[0] || '.woff2';
                const outputPath = join(tempDir, `${fontName}${fontExtension}`);
                try {
                    console.log('Downloading font from Google Fonts...');
                    const response = await axios({
                        url: googleFontUrl,
                        method: 'GET',
                        responseType: 'stream',
                    });

                    const writer = createWriteStream(outputPath);
                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    console.log(`Font downloaded successfully from Google Fonts: ${outputPath}`);
                    return { fontName, fontPath: outputPath, fontUrl: googleFontUrl };
                } catch (error) {
                    console.error(`Failed to download font from Google Fonts: ${error.message}`);
                }
            }
        }

        if (websiteUrl) {
            console.log(`${fontName === 'abc' ? 'Getting first available font from website' : `Google Fonts did not have "${fontName}". Attempting website extraction.`}`);
            const fontPath = await downloadFontFromWebsite(fontName, websiteUrl);
            return { fontName, fontPath };
        }

        throw new Error(`Font "${fontName}" not found on Google Fonts or website.`);
    } catch (error) {
        console.error(`Failed to save font "${fontName}":`, error.message);
        throw error;
    }
}
