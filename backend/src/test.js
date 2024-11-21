import gplay from 'google-play-scraper';

const appId = 'com.application.zomato';

const fetchAppNameFromGooglePlay = async (appId) => {
    try {
        const appDetails = await gplay.app({ appId }); // Fetch app details
        const appName = appDetails.title; // Extract the app name (title)
        console.log(`App Name fetched from Google Play: ${appName}`);
        return appName; // Return the app name
    } catch (error) {
        console.error(`Failed to fetch app name for App ID: ${appId}`, error.message);
        throw new Error(`Unable to fetch app name for App ID: ${appId}`);
    }
};

// Call the function
(async () => {
    await fetchAppNameFromGooglePlay(appId);
})();
