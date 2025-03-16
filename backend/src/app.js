import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js"; // Importing user routes
import { connectToSocket } from "./controllers/socketManager.js";

const app = express(); // Creating an instance of Express
const server = createServer(app); // Creating an HTTP server
const io = connectToSocket(server); // Initializing Socket.IO

// Middleware
app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

// Debugging: Log environment variables
console.log("🔍 Checking environment variables...");
console.log("DB_USER:", process.env.DB_USER || "❌ Not Defined");
console.log("DB_CLUSTER:", process.env.DB_CLUSTER || "❌ Not Defined");
console.log("DB_NAME:", process.env.DB_NAME || "❌ Not Defined");

const start = async () => {
  try {
    // Validate MongoDB environment variables
    if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_CLUSTER || !process.env.DB_NAME) {
      console.error("❌ Error: Missing MongoDB environment variables!");
      process.exit(1);
    }

    // Construct MongoDB URI
    const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}`;
    console.log("🔗 Mongo URI:", mongoURI);

    // Connect to MongoDB
    const connectionDb = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MONGO connected: ${connectionDb.connection.host}`);

    // Start the server
    server.listen(app.get("port"), () => {
      console.log(`🚀 Server running on port ${app.get("port")}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is connected!" });
});

// Start the app
start();
