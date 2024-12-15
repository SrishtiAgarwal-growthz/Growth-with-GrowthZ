import express from "express";
import appRoutes from "./appRoutes.js";
import reviewsRoutes from "./reviewsRoutes.js";
import communicationsRoutes from "./communicationRoutes.js";
import taskRoutes from "./taskRoutes.js";
import creativesRoutes from "./creativesRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// Protected routes
router.use("/app", appRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/communications", communicationsRoutes);
router.use("/tasks", taskRoutes);
router.use("/creatives", creativesRoutes);
router.use("/users", userRoutes);

export default router;
