import express from "express";
import { createUserInMongoDB } from "../controllers/authController.js";

const router = express.Router();

router.post("/users", createUserInMongoDB); // New route for MongoDB storage
console.log("[AuthRoutes] Store user route initialized.");

export default router;
