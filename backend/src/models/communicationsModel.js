export const savePhraseToDatabase = async (db, collectionName, email, phrase) => {
    try {
      const collection = db.collection(collectionName);
      await collection.updateOne(
        { email },
        { $push: { phrases: phrase } },
        { upsert: true }
      );
      console.log(`Phrase saved to ${collectionName} for email: ${email}`);
    } catch (error) {
      console.error(`Error saving phrase to ${collectionName}:`, error);
      throw error;
    }
  };
  