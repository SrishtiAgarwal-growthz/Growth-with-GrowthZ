import { connectToMongo } from "../config/db.js";

/**
 * Approve a phrase by updating its status to "approved".
 * @param {string} appId - The ID of the app.
 * @param {string} text - The text of the phrase to approve.
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const approvePhraseService = async (text, appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[approvePhraseService] Approving phrase: "${text}" for appId: ${appId}`);

    const result = await adCopiesCollection.updateOne(
      { "phrases.text": text, appId },
      { $set: { "phrases.$.status": "approved" } }
    );

    console.log(`[approvePhraseService] Update result:`, result);
    return result;
  } finally {
    await client.close();
  }
};

/**
 * Reject a phrase by updating its status to "rejected".
 * @param {string} appId - The ID of the app.
 * @param {string} text - The text of the phrase to reject.
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const rejectPhraseService = async (text, appId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[rejectPhraseService] Rejecting phrase: "${text}" for appId: ${appId}`);

    const result = await adCopiesCollection.updateOne(
      { "phrases.text": text, appId },
      { $set: { "phrases.$.status": "rejected" } }
    );

    console.log(`[rejectPhraseService] Update result:`, result);
    return result;
  } finally {
    await client.close();
  }
};
