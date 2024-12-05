import { connectToMongo } from '../config/db.js';
export const createUserInMongoDB = async (req, res) => {
  try {
    const { email, fullName, companyName } = req.body;

    if (!email || !fullName || !companyName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    const user = { email, fullName, companyName, createdAt: new Date() };
    const result = await usersCollection.insertOne(user);

    res.status(201).json({ message: "User created successfully.", userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Error creating user.", error: error.message });
  }
};
