import express from "express";
import appRoutes from "./appRoutes.js";
import reviewsRoutes from "./reviewsRoutes.js";
import reviewsStatusRoutes from "./reviewsStatusRoutes.js";
import taskRoutes from "./taskRoutes.js";
import creativesRoutes from "./creativesRoutes.js";
import creativesStatusRoutes from "./creativesStatusRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// Protected routes
router.use("/app", appRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/adCopyStatus", reviewsStatusRoutes);
router.use("/tasks", taskRoutes);
router.use("/creatives", creativesRoutes);
router.use("/creativesStatus", creativesStatusRoutes);
router.use("/users", userRoutes);

export default router;
