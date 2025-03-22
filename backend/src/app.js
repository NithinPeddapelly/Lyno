import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();

// Create an HTTP server using Express
const server = createServer(app);

// Initialize Socket.io with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://lyno-frontend.onrender.com", // Allow frontend to connect
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
  },
});

// Set the port for the server, defaulting to 8000 if not specified in the environment variables
app.set("port", process.env.PORT || 8000);

// Middleware setup
app.use(
  cors({
    origin: "https://lyno-frontend.onrender.com", // Allow frontend to connect
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

app.use(express.json({ limit: "100kb" })); // Parse incoming JSON requests with a limit of 40kb
app.use(express.urlencoded({ limit: "40kb", extended: true })); // Parse URL-encoded data with the same size limit

// Define routes
app.use("/api/v1/users", userRoutes); // User-related API routes

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });

  // Example: Handle custom events
  socket.on("message", (data) => {
    console.log("Received message:", data);
    io.emit("message", data); // Broadcast the message to all connected clients
  });
});

// Function to start the server and connect to the database
const start = async () => {
  try {
    // Connect to MongoDB Atlas cluster
    const connectionDb = await mongoose.connect(
      "mongodb+srv://nithin_peddapellyLYNO:enteryourpasswordhere@cluster.qq0z7.mongodb.net/"
    );
    console.log(`MONGO Connected. DB Host: ${connectionDb.connection.host}`);

    // Start the server and listen on the defined port
    server.listen(app.get("port"), () => {
      console.log(`LISTENING ON PORT ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit process with failure if connection fails
  }
};

// Call the start function to initiate the server and database connection
start();