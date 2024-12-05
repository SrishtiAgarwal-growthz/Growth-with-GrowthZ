import express from "express";
import { createTask, getUserTasks } from "../controllers/taskController.js";

const router = express.Router();

// Protected routes for tasks
router.post("/create", createTask); // Create a task
router.get("/user-tasks", getUserTasks); // Fetch tasks for the logged-in user

export default router;
