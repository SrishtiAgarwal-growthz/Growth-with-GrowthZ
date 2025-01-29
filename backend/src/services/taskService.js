import { connectToMongo } from "../config/db.js";

/**
 * saveTask:
 *  - Previously, you always did an `insertOne` for each request, creating multiple tasks.
 *  - Now, check if a Task doc for (userId, appId) already exists.
 *  - If yes, just return it. If not, create a new doc.
 */
export const saveTask = async (userId, appId) => {
  console.log("[TaskService] Checking for existing task for user:", userId, "and app:", appId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const tasksCollection = db.collection("Tasks");

  try {
    // 1) Find if there's already a task for this user+app
    const existingTask = await tasksCollection.findOne({ userId, appId });
    if (existingTask) {
      console.log("[TaskService] Task already exists. Returning existing doc:", existingTask._id);
      return existingTask;
    }

    const nowUTC = new Date(); // Get current UTC time
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const createdAtIST = new Date(nowUTC.getTime() + ISTOffset);

    // 2) Otherwise, create a brand-new Task doc
    const newTask = {
      userId,
      appId,
      createdAt: createdAtIST,
      tasks: ["AdCopies"], // or any default
    };

    const result = await tasksCollection.insertOne(newTask);
    console.log("[TaskService] New Task created with _id:", result.insertedId);

    return { ...newTask, _id: result.insertedId };
  } finally {
    await client.close();
  }
};


export const addCreativesTask = async (userId, appId, task) => {
  try {
    console.log(`[TaskService] Adding task "${task}" for user: ${userId} and app: ${appId}`);
    const client = await connectToMongo();
    const db = client.db("GrowthZ");
    const tasksCollection = db.collection("Tasks");

    // Use $addToSet to ensure "task" is added to the array without duplication
    const result = await tasksCollection.updateOne(
      {
        userId: userId,
        appId: appId
      },
      {
        $setOnInsert: {
          userId: userId,
          appId: appId,
          createdAt: new Date(),
        },
        $addToSet: {
          tasks: task, // Add the task to the array only if it doesn't already exist
        },
      },
      { upsert: true } // Create a new document if none exists
    );

    if (result.upsertedCount > 0) {
      console.log(`[TaskService] New task document created with _id: ${result.upsertedId._id}`);
    } else {
      console.log(`[TaskService] Task array updated successfully for userId: ${userId} and appId: ${appId}`);
    }
  } catch (error) {
    console.error("[TaskService] Error updating task:", error.message);
    throw error;
  }
};

export const getTasksByUserId = async (userId) => {
  console.log("[TaskService] Fetching tasks for user:", userId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const tasksCollection = db.collection("Tasks");

  const tasks = await tasksCollection.find({ userId }).toArray();
  console.log("[TaskService] Tasks fetched successfully:", tasks.length);

  return tasks;
};


