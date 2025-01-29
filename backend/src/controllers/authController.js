import { connectToMongo } from '../config/db.js';

/**
 * Create a user in MongoDB based on the incoming email, fullName, and companyName.
 * Also returns the inserted Mongo _id so the frontend can store it in localStorage.
 */
export const createUserInMongoDB = async (req, res) => {
  try {
    const { email, fullName, companyName } = req.body;

    // Basic validation
    if (!email || !fullName || !companyName) {
      return res.status(400).json({ message: "All fields (email, fullName, companyName) are required." });
    }

    // Connect to Mongo
    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    // Convert email to lowercase for consistency
    const userEmail = email.toLowerCase().trim();

    const nowUTC = new Date(); // Get current UTC time
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const createdAtIST = new Date(nowUTC.getTime() + ISTOffset);

    // Insert into Mongo
    const newUser = {
      userEmail,      // or just "email"
      fullName,
      companyName,
      createdAt: createdAtIST,
    };

    const result = await usersCollection.insertOne(newUser);

    // Return the insertedId so client can store it
    res.status(201).json({
      message: "User created successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating user in MongoDB:", error.message);
    res.status(500).json({ message: "Error creating user.", error: error.message });
  }
};
