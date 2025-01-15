// rainbowApi.js
const BASE_URL = "https://growth-with-growthz.onrender.com";

/**
 * POST /api/creatives/addCreativeToTasks
 * This adds "Creatives" to the user's tasks array.
 */
export const addCreativeToTasks = async (userId, appId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/creatives/addCreativeToTasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, appId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add Creatives task');
    }
    return response.json();
  } catch (error) {
    console.error('Error in addCreativeToTasks:', error.message);
    throw error;
  }
};

/**
 * POST /api/creatives/createAd
 * This triggers the backend to generate ads/creatives for the specified app.
 */
export const createAds = async (userId, appId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/creatives/createAd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, appId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create ads');
    }
    return response.json();
  } catch (error) {
    console.error('Error in createAds:', error.message);
    throw error;
  }
};

/**
 * POST /api/creatives/createAd
 * This triggers the backend to generate ads/creatives for the specified app.
 */
export const createAnimations = async (userId, appId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/creatives/createAnimation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, appId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create ads');
    }
    return response.json();
  } catch (error) {
    console.error('Error in createAnimations:', error.message);
    throw error;
  }
};

// in rainbowApi.js
export const getGeneratedAds = async (appId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/creatives/get-ads?appId=${appId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch generated ads');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching generated ads:", error.message);
    throw error;
  }
};
