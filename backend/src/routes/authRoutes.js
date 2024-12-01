import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Public routes for authentication
router.post("/register", registerUser);
console.log("[AuthRoutes] Register route initialized.");
router.post("/login", loginUser);
console.log("[AuthRoutes] Login route initialized.");

export default router;
