import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";

console.log("Starting server...");

// Load .env
dotenv.config();

// Connect Database
connectDB();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

console.log('CORS allowed origin:', FRONTEND_URL);

app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/checkins", checkinRoutes);

// Fallback for unknown routes (Express 5)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

