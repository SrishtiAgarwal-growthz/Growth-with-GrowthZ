// geniusApi.js

const BASE_URL = 'https://growth-with-growthz.onrender.com';

/**
 * Save app details by making a POST request to the backend.
 *
 * @param {Object} formData - The form data containing app URLs.
 * @returns {Promise<Object>} - The saved app data from the backend.
 */
export const saveAppDetails = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/app/save-app`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                google_play: formData.google_play,
                apple_app: formData.apple_app,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save app details');
        }

        const appData = await response.json();
        return appData.appDetails; // Return full app details, including _id
    } catch (error) {
        console.error('Error saving app details:', error.message);
        throw error;
    }
};

/**
 * Create a task for the user and app.
 *
 * @param {string} appId - The ID of the saved app.
 * @param {string} userId - The ID of the logged-in user.
 * @returns {Promise<Object>} - The created task from the backend.
 */
export const createTask = async (appId, email) => {
    console.log("Sending appId:", appId, "and email:", email); // Log values
    try {
        const response = await fetch(`${BASE_URL}/api/tasks/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appId,
                email,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create task');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error.message);
        throw error;
    }
};

/**
 * Generate USP phrases by making a POST request to the backend.
 *
 * @param {Object} formData - The form data containing app URLs.
 * @param {string} appId - The ID of the saved app.
 * @returns {Promise<Object>} - The generated phrases from the backend.
 */
export const generatePhrases = async (formData, appId, userId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/reviews/generate-phrases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                google_play: formData.google_play,
                apple_app: formData.apple_app,
                website_link: formData.website,
                appId,
                userId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate phrases');
        }

        return await response.json();
    } catch (error) {
        console.error('Error generating phrases:', error.message);
        throw error;
    }
};

/**
 * Approve a specific USP phrase by making a POST request to the backend.
 *
 * @param {string} appId - The ID of the saved app.
 * @param {string} text - The USP phrase to approve.
 * @returns {Promise<Object>} - The approval response from the backend.
 */
export const approvePhrase = async (text, appId) => {
    console.log("approvePhrase - Sending:", { text, appId }); // Verify appId and text
    try {
        const response = await fetch(`${BASE_URL}/api/communications/approved`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,   // Ensure text is being passed correctly
                appId: appId, // Ensure appId is correct
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve the phrase');
        }

        return await response.json();
    } catch (error) {
        console.error('Error approving phrase:', error.message);
        throw error;
    }
};

/**
 * Reject a specific USP phrase by making a POST request to the backend.
 *
 * @param {string} appId - The ID of the saved app.
 * @param {string} text - The USP phrase to reject.
 * @returns {Promise<Object>} - The rejection response from the backend.
 */
export const rejectPhrase = async (appId, text) => {
    try {
        const response = await fetch(`${BASE_URL}/api/communications/rejected`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appId: appId,
                text: text,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to reject the phrase');
        }

        return await response.json();
    } catch (error) {
        console.error('Error rejecting phrase:', error.message);
        throw error;
    }
};
