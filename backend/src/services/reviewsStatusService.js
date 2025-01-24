import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";  // <-- Make sure you have this import

/**
 * Approve a phrase by updating its status to "approved".
 * Handles both app-based (appId) and website-based (_id).
 * 
 * @param {string} text - The text of the phrase to approve.
 * @param {string} docId - The "appId" for apps OR the "_id" for website docs
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const approvePhraseService = async (text, docId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[approvePhraseService] Approving phrase: "${text}" for docId: ${docId}`);

    // We'll match either "appId = docId" OR "_id = ObjectId(docId)"
    // Also require that the nested phrase has text == the phrase we want.
    const query = {
      "phrases.text": text,
      $or: [
        { appId: docId },
      ]
    };

    // Attempt to add an _id match (for website docs) if docId is a valid ObjectId
    try {
      const asObjectId = new ObjectId(docId);
      // If new ObjectId(docId) didn't throw, we can include it
      query.$or.push({ _id: asObjectId });
    } catch (err) {
      // docId is not a valid ObjectId, so skip
      // This is fine if it's purely an appId for app-based docs
    }

    const result = await adCopiesCollection.updateOne(
      query,
      { $set: { "phrases.$.status": "approved" } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Phrase not found or already approved" });
    }

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
 * @param {string} docId - The "appId" for apps OR the "_id" for website docs
 * @returns {Promise<Object>} - MongoDB update result.
 */
export const rejectPhraseService = async (text, docId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const adCopiesCollection = db.collection("AdCopies");

  try {
    console.log(`[rejectPhraseService] Rejecting phrase: "${text}" for docId: ${docId}`);

    // We'll match either "appId = docId" OR "_id = ObjectId(docId)"
    // Also require that the nested phrase has text == the phrase we want.
    const query = { 
      "phrases.text": text, 
      $or: [{ appId: docId }]
    };

    // Attempt to add an _id match for website docs
    try {
      const asObjectId = new ObjectId(docId);
      query.$or.push({ _id: asObjectId });
    } catch (err) {
      // docId is not a valid ObjectId (this is probably an app doc), so ignore
    }

    const result = await adCopiesCollection.updateOne(
      query,
      { $set: { "phrases.$.status": "rejected" } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Phrase not found or already approved" });
    }

    console.log(`[rejectPhraseService] Update result:`, result);
    return result;
  } finally {
    await client.close();
  }
};
