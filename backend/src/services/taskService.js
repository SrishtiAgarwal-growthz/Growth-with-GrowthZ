import { connectToMongo } from "../config/db.js";

export const saveTask = async (userId, appId) => {
  console.log("[TaskService] Saving task for user:", userId);

  const client = await connectToMongo();
  const db = client.db("GrowthZ");
  const tasksCollection = db.collection("Tasks");

  const task = {
    userId: userId,
    appId: appId,
    createdAt: new Date(),
    tasks: ["AdCopies"],
  };

  const result = await tasksCollection.insertOne(task);
  console.log("[TaskService] Task saved successfully:", result.insertedId);

  return { ...task, _id: result.insertedId };
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


