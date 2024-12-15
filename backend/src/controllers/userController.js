import { connectToMongo } from "../config/db.js";

export const getUserByEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("[getUserByEmail] Error:", error.message);
    res.status(500).json({ message: "Failed to fetch user by email.", error: error.message });
  }
};
