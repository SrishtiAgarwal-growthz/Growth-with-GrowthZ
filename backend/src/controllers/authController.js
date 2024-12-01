import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectToMongo } from "../config/db.js";

// POST /auth/register
export const registerUser = async (req, res) => {
  console.log("[AuthController] Register user request received.");
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.warn("[AuthController] Missing required fields.");
      return res.status(400).json({ message: "All fields are required." });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.warn("[AuthController] Email already registered:", email);
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);
    console.log("[AuthController] User registered successfully:", username);

    res.status(201).json({
      message: "User registered successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("[AuthController] Error registering user:", error.message);
    res.status(500).json({ message: "Error registering user." });
  }
};

// POST /auth/login
export const loginUser = async (req, res) => {
  console.log("[AuthController] Login user request received.");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("[AuthController] Missing email or password.");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.warn("[AuthController] Invalid email:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn("[AuthController] Invalid password for email:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("[AuthController] Login successful for user:", email);
    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("[AuthController] Error logging in user:", error.message);
    res.status(500).json({ message: "Error logging in user." });
  }
};
