// import { writeFileSync } from "fs";
// import { join } from "path";
// import { launch } from "puppeteer";

// /**
//  * Generate an ad image using the provided HTML and Puppeteer.
//  * @param {Array<string>} approvedPhrases - Approved phrases for the ad text.
//  * @param {string} iconUrl - Absolute path or URL of the logo image.
//  * @param {Object} fontDetails - Font details with `fontName` and `fontPath`.
//  * @param {Array<Object>} updatedImages - Processed images data.
//  * @returns {Promise<string>} - Path to the generated ad image.
//  */
// export const createAd = async (approvedPhrases, iconUrl, fontDetails, updatedImages) => {
//   try {
//     console.log("[createAd] Starting ad generation.");

//     const browser = await launch({ headless: true });
//     const page = await browser.newPage();

//     const fontFaceRule = fontDetails.fontPath
//       ? `@font-face { font-family: '${fontDetails.fontName}'; src: url('${fontDetails.fontPath}'); }`
//       : "";

//     const backgroundColor = updatedImages[0]?.backgroundColor || "#ffffff";
//     const absoluteLogoImageUrl = `file://${iconUrl.replace(/\\/g, "/")}`;
//     const absoluteMainImageUrl = `file://${updatedImages[0]?.removedBgUrl.replace(/\\/g, "/")}`;
//     const adText = approvedPhrases[0] || "Your Ad Text Here";

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
//           <style>
//               ${fontFaceRule}
//               body {
//                   margin: 0;
//                   padding: 0;
//                   background: ${backgroundColor};
//               }
//               .ad-container {
//                   width: 160px;
//                   height: 600px;
//                   background: white;
//                   position: relative;
//                   font-family: 'Inter', sans-serif;
//                   overflow: hidden;
//               }
//               .logo {
//                   position: absolute;
//                   top: 22px;
//                   right: 10px;
//                   width: 50px;
//                   height: 50px;
//                   object-fit: contain;
//               }
//               .text-content {
//                   font-family: ${fontDetails.fontPath ? `'${fontDetails.fontName}'` : 'Inter'};
//                   position: absolute;
//                   top: 122px;
//                   width: 100%;
//                   text-align: center;
//                   font-size: 18px;
//                   padding: 0 10px;
//                   box-sizing: border-box;
//                   line-height: 1.2;
//               }
//               .main-image {
//                   position: absolute;
//                   top: 260px;
//                   left: 50%;
//                   transform: translateX(-50%);
//                   width: 100%;
//                   height: auto;
//                   max-height: 250px;
//                   object-fit: contain;
//               }
//               .cta-button {
//                   position: absolute;
//                   bottom: 30px;
//                   left: 50%;
//                   transform: translateX(-50%);
//                   width: 120px;
//                   height: 40px;
//                   background: red;
//                   color: white;
//                   border: none;
//                   font-weight: bold;
//                   font-size: 16px;
//                   cursor: pointer;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="ad-container" id="adContainer">
//               <img class="logo" src="${absoluteLogoImageUrl}" alt="Logo">
//               <div class="text-content">${adText}</div>
//               <img class="main-image" src="${absoluteMainImageUrl}" alt="Main Image">
//               <button class="cta-button">Order Now</button>
//           </div>
//       </body>
//       </html>
//     `;

//     console.log("[createAd] Setting ad content in Puppeteer.");
//     await page.setContent(htmlContent);

//     console.log("[createAd] Ensuring all images are loaded.");
//     await page.evaluate(() => {
//       const images = document.querySelectorAll("img");
//       return Promise.all(
//         Array.from(images).map(
//           (img) =>
//             img.complete
//               ? Promise.resolve()
//               : new Promise((resolve, reject) => {
//                   img.onload = resolve;
//                   img.onerror = reject;
//                 })
//         )
//       );
//     });

//     console.log("[createAd] Taking a screenshot of the ad.");
//     const screenshotPath = join(process.cwd(), `ad-${Date.now()}.png`);
//     await page.screenshot({ path: screenshotPath, fullPage: false });

//     console.log(`[createAd] Ad image saved at: ${screenshotPath}`);
//     await browser.close();

//     return screenshotPath;
//   } catch (error) {
//     console.error(`[createAd] Error generating ad: ${error.message}`);
//     throw error;
//   }
// };
