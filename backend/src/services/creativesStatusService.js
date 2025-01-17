import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";

/**
 * Approve a creative
 * @param {string} creativeId - The ID of the creative to approve.
 * @returns {Promise<Object>} - The updated creative document.
 */
export const approveCreativeService = async (creativeId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const creativesCollection = db.collection("Creatives");

  try {
    // First try to update in adUrls array (for static ads)
    let result = await creativesCollection.updateOne(
      { "adUrls.creativeUrl.adUrl": creativeId },
      { $set: { "adUrls.$[elem].status": "approved" } },
      { arrayFilters: [{ "elem.creativeUrl.adUrl": creativeId }] }
    );

    // If not found in adUrls, try animationUrls array
    if (result.modifiedCount === 0) {
      result = await creativesCollection.updateOne(
        { "animationUrls.creativeUrl.animationUrl": creativeId },
        { $set: { "animationUrls.$[elem].status": "approved" } },
        { arrayFilters: [{ "elem.creativeUrl.animationUrl": creativeId }] }
      );
    }

    if (result.modifiedCount === 0) {
      throw new Error("Creative not found or already approved.");
    }

    // Find the updated document
    const updatedCreative = await creativesCollection.findOne({
      $or: [
        { "adUrls.creativeUrl.adUrl": creativeId },
        { "animationUrls.creativeUrl.animationUrl": creativeId }
      ]
    });

    return updatedCreative;
  } finally {
    await client.close();
  }
};

/**
 * Reject a creative
 * @param {string} creativeId - The ID of the creative to reject.
 * @returns {Promise<Object>} - The updated creative document.
 */
export const rejectCreativeService = async (creativeId) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const creativesCollection = db.collection("Creatives");

  try {
    // First try to update in adUrls array
    let result = await creativesCollection.updateOne(
      { "adUrls.creativeUrl.adUrl": creativeId },
      { $set: { "adUrls.$[elem].status": "rejected" } },
      { arrayFilters: [{ "elem.creativeUrl.adUrl": creativeId }] }
    );

    // If not found in adUrls, try animationUrls array
    if (result.modifiedCount === 0) {
      result = await creativesCollection.updateOne(
        { "animationUrls.creativeUrl.animationUrl": creativeId },
        { $set: { "animationUrls.$[elem].status": "rejected" } },
        { arrayFilters: [{ "elem.creativeUrl.animationUrl": creativeId }] }
      );
    }

    if (result.modifiedCount === 0) {
      throw new Error("Creative not found or already rejected.");
    }

    // Find the updated document
    const updatedCreative = await creativesCollection.findOne({
      $or: [
        { "adUrls.creativeUrl.adUrl": creativeId },
        { "animationUrls.creativeUrl.animationUrl": creativeId }
      ]
    });

    return updatedCreative;
  } finally {
    await client.close();
  }
};

/**
 * Fetch creatives by status
 * @param {string} status - The status of creatives to fetch (approved/rejected/pending).
 * @returns {Promise<Array>} - List of creatives with the specified status.
 */
export const fetchCreativesByStatus = async (status) => {
  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const creativesCollection = db.collection("Creatives");

  try {
    const creatives = await creativesCollection
      .find({
        $or: [
          { "adUrls.status": status },
          { "animationUrls.status": status }
        ]
      })
      .toArray();

    return creatives;
  } finally {
    await client.close();
  }
};