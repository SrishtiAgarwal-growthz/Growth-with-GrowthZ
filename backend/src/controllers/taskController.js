import { saveTask, getTasksByUserId } from "../services/taskService.js";

export const createTask = async (req, res) => {
  console.log("[TaskController] Request to create task received:", req.body);

  try {
    // Extract userId and appId from the request body
    const { appId, userId } = req.body;

    // Validate inputs
    if (!appId) {
      console.warn("[TaskController] Missing appId in request body.");
      return res.status(400).json({ message: "App ID is required." });
    }

    if (!userId) {
      console.warn("[TaskController] Missing userId in request body.");
      return res.status(400).json({ message: "User ID is required." });
    }

    // Create the task
    const task = await saveTask(userId, appId);

    // Respond with success
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
