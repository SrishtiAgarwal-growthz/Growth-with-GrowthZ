import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";  // <-- Make sure you have this import

/**
 * Approve a phrase by updating its status to "approved".
 * Handles both app-based (appId) and website-based (_id).
 * 
 * @param {string} text - The text of the phrase to approve.
 * @param {string} appId - The "appId" for apps OR the "_id" for website docs
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const approvePhraseService = async (text, appId, userId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[approvePhraseService] Approving phrase: "${text}" for appId: ${appId}`);

    // Also require that the nested phrase has text == the phrase we want.
    const query = { "phrases.text": text, appId, userId  };

    const result = await adCopiesCollection.updateOne(
      query,
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
 * Handles both app-based (appId) and website-based (_id).
 * 
 * @param {string} text - The text of the phrase to reject.
 * @param {string} appId - The "appId" for apps OR the "_id" for website docs
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const rejectPhraseService = async (text, appId, userId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[rejectPhraseService] Rejecting phrase: "${text}" for appId: ${appId}`);

    // Also require that the nested phrase has text == the phrase we want.
    const query = { "phrases.text": text, appId, userId  };

    const result = await adCopiesCollection.updateOne(
      query,
      { $set: { "phrases.$.status": "rejected" } }
    );

    console.log(`[rejectPhraseService] Update result:`, result);
    return result;
  } finally {
    await client.close();
  }
};
