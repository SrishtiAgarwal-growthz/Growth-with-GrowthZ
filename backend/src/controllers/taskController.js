import { connectToMongo } from "../config/db.js";
import { saveTask, getTasksByUserId } from "../services/taskService.js";

export const createTask = async (req, res) => {
  console.log("[TaskController] Request Body:", req.body);

  try {
    const { appId, email } = req.body;

    if (!appId || !email) {
      return res.status(400).json({ message: "App ID and email are required." });
    }

    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.error("[TaskController] User not found for email:", email);
      return res.status(404).json({ message: "User not found." });
    }

    const userId = user._id.toString(); // MongoDB ObjectId
    console.log("[TaskController] Found userId:", userId);

    const task = await saveTask(userId, appId);

    res.status(201).json({
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    console.error("[TaskController] Error creating task:", error.message);
    res.status(500).json({ message: "Error creating task.", error: error.message });
  }
};

/**
 * Fetch all tasks for a user.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
export const getUserTasks = async (req, res) => {
  console.log("[TaskController] Request to fetch user tasks received.");

  try {
    const userId = req.user.id; // User ID from JWT token
    const tasks = await getTasksByUserId(userId);

    res.status(200).json({
      message: "Tasks fetched successfully.",
      tasks,
    });
  } catch (error) {
    console.error("[TaskController] Error fetching tasks:", error.message);
    res.status(500).json({ message: "Error fetching tasks.", error: error.message });
  }
};
