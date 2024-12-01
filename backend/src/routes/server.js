import express from "express";
import authRoutes from "./authRoutes.js";
import appRoutes from "./appRoutes.js";
import reviewsRoutes from "./reviewsRoutes.js";
import communicationsRoutes from "./communicationRoutes.js";
import taskRoutes from "./taskRoutes.js"; // Import task routes
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/app", authenticate, appRoutes);
router.use("/reviews", authenticate, reviewsRoutes);
router.use("/communications", authenticate, communicationsRoutes);
router.use("/tasks", authenticate, taskRoutes); // Register task routes

export default router;
