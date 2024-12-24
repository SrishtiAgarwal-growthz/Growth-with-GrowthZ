import express from "express";
import {
  approveCreative,
  rejectCreative,
  getCreativesByStatus,
} from "../controllers/creativesStatusController.js";

const router = express.Router();

// Approve a creative
router.post("/approve", approveCreative);

// Reject a creative
router.post("/reject", rejectCreative);

// Fetch creatives by approval status
router.get("/:status", getCreativesByStatus);

export default router;
