import express from "express";
import dotenv from "dotenv";
import { connectToMongo } from './src/config/db.js';
import { configureCORS } from "./src/middlewares/cors.js";
import authRoutes from "./src/routes/authRoutes.js"; 
import routes from "./src/routes/server.js";

dotenv.config();

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Middleware to handle CORS
app.use(configureCORS);

app.use((req, res, next) => {
  console.log("[Server] Request Body:", req.body);
  next();
});

app.get("/", (req, res) => {
  console.log("[Server] Health check route hit.");
  res.send("Server is running!");
});

connectToMongo().then(() => {
  console.log("Connected to MongoDB!");
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
});

// Routes
app.use("/auth", authRoutes);
app.use("/api", routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));

export default app;
