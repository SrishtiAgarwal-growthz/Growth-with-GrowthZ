import express from "express";
import { getUserByEmail } from "../controllers/userController.js";

const router = express.Router();

// Route to fetch user by email
router.post("/get-user-by-email", getUserByEmail);

export default router;
