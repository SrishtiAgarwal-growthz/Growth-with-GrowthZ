import express from "express";
import appRoutes from "./appRoutes.js";
import reviewsRoutes from "./reviewsRoutes.js";
import phraseRoutes from "./phraseRoutes.js";
import communicationsRoutes from "./communicationRoutes.js";
import taskRoutes from "./taskRoutes.js"; // Import task routes
import creativesRoutes from "./creativesRoutes.js";

const router = express.Router();

// Protected routes
router.use("/app", appRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/phrases", phraseRoutes);
router.use("/communications", communicationsRoutes);
router.use("/tasks", taskRoutes); // Register task routes
router.use("/creatives", creativesRoutes);

export default router;
