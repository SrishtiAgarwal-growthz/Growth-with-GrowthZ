export const extractGooglePlayAppId = (url) => {
    const match = url.match(/id=([a-zA-Z0-9._]+)/);
    return match ? match[1] : null;
};

export const extractAppleAppId = (url) => {
    const match = url.match(/\/id(\d+)/); // Extract the numeric App ID
    return match ? match[1] : null;
};

export const combineReviews = (googleReviews, appleReviews) => {
    const combinedReviews = [
        ...googleReviews,
        ...appleReviews,
    ];
    return combinedReviews.join("\n"); // Combine as a single string
};
