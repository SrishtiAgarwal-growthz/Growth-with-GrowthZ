export const saveCreativeUrl = async (db, email, creativeUrl) => {
    const collection = db.collection('Creatives');
    await collection.updateOne(
      { email },
      { $push: { creativeUrls: creativeUrl } },
      { upsert: true }
    );
    console.log(`Creative URL saved for email: ${email}`);
  };
  