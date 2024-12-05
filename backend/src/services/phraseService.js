import { connectToMongo } from "../config/db.js";
import { ObjectId } from "mongodb";

export const saveGeneratedPhrases = async (appId, taskId, phrases) => {
  console.log("[PhraseService] Saving generated phrases for app:", appId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const phrasesCollection = db.collection("AdCopies");

  const document = {
    appId: appId,
    taskId: taskId,
    phrases: phrases.map((phrase) => ({
      _id: new ObjectId(),
      text: phrase,
      status: "pending", // Default status
    })),
    createdAt: new Date(),
  };

  const result = await phrasesCollection.insertOne(document);
  console.log("[PhraseService] Phrases saved successfully:", result.insertedId);

  return { ...document, _id: result.insertedId };
};

export const updatePhraseStatus = async (phraseId, status) => {
  console.log("[PhraseService] Updating status of phrase:", { phraseId, status });

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const phrasesCollection = db.collection("Phrases");

  const result = await phrasesCollection.updateOne(
    { "phrases._id": ObjectId(phraseId) },
    { $set: { "phrases.$.status": status } }
  );

  if (result.matchedCount === 0) {
    throw new Error("Phrase not found.");
  }

  console.log("[PhraseService] Phrase status updated successfully.");
  return result;
};
