export const extractGooglePlayAppId = (url) => {
    const match = url.match(/id=([a-zA-Z0-9._]+)/);
    return match ? match[1] : null;
};

export const extractAppleAppId = (url) => {
    const match = url.match(/\/app\/([^/]+)\/id(\d+)/);
    return match ? match[1] : null;
};

export const combineReviews = (googleReviews, appleReviews) => {
    const googleText = googleReviews.map((review) => review.text || '').join(' ');
    const appleText = appleReviews.map((review) => review.review || '').join(' ');
    return `${googleText}\n${appleText}`;
};
