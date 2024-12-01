import express from "express";
import { createTask, getUserTasks } from "../controllers/taskController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes for tasks
router.post("/create", authenticate, createTask); // Create a task
router.get("/user-tasks", authenticate, getUserTasks); // Fetch tasks for the logged-in user

export default router;
