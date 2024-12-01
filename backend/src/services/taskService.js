import { connectToMongo } from "../config/db.js";

/**
 * Save a new task for a user.
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} appId - The ID of the app for which the task is created.
 * @returns {object} - The newly created task.
 */
export const saveTask = async (userId, appId) => {
  console.log("[TaskService] Saving task for user:", userId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const tasksCollection = db.collection("Tasks");

  const task = {
    userId,
    appId,
    createdAt: new Date(),
    tasks: ["AdCopies"],
  };

  const result = await tasksCollection.insertOne(task);
  console.log("[TaskService] Task saved successfully:", result.insertedId);

  return { ...task, _id: result.insertedId };
};

/**
 * Fetch all tasks for a user by their user ID.
 * @param {string} userId - The ID of the logged-in user.
 * @returns {array} - Array of tasks for the user.
 */
export const getTasksByUserId = async (userId) => {
  console.log("[TaskService] Fetching tasks for user:", userId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const tasksCollection = db.collection("Tasks");

  const tasks = await tasksCollection.find({ userId }).toArray();
  console.log("[TaskService] Tasks fetched successfully:", tasks.length);

  return tasks;
};
