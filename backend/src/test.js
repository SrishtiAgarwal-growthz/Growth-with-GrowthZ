// import gplay from 'google-play-scraper';

// const appId = 'com.application.zomato';

// const fetchAppNameFromGooglePlay = async (appId) => {
//     try {
//         const appDetails = await gplay.app({ appId }); // Fetch app details
//         const appName = appDetails.title; // Extract the app name (title)
//         console.log(`App Name fetched from Google Play: ${appName}`);
//         return appName; // Return the app name
//     } catch (error) {
//         console.error(`Failed to fetch app name for App ID: ${appId}`, error.message);
//         throw new Error(`Unable to fetch app name for App ID: ${appId}`);
//     }
// };

// // Call the function
// (async () => {
//     await fetchAppNameFromGooglePlay(appId);
// })();

import fs from "fs/promises"; // For writing files during testing
import { removeBackground } from "./removeBackground.js"; // Assuming you saved the corrected function
import dotenv from "dotenv";
dotenv.config();

async function testRemoveBg() {
  const testImageUrl = "https://play-lh.googleusercontent.com/V-GWQkzuBufKdp1MayUkYLQs4BSLkx01irIbdwe2BQv7VaG73KbJujjNWLwHXOewXV0"; // Replace with a valid URL

  try {
    const buffer = await removeBackground(testImageUrl);

    // Optionally save the output to verify
    await fs.writeFile("output-no-bg.png", Buffer.from(buffer));
    console.log("Background removed and image saved as output-no-bg.png");
  } catch (error) {
    console.error("Error during background removal:", error.message);
  }
}

testRemoveBg();
