import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";

const app = express(); // Creating an instance of Express
const server = createServer(app); // Creating an HTTP server and integrating it with Express
const io = connectToSocket(server); // Initializing Socket.IO and connecting it to the server

app.set("port", process.env.PORT || 8000); // Setting the port for the server (default: 8000)

app.get("/home", (req, res) => {
   return res.json({ hello: "world" }); // Responding with a JSON object containing a greeting message
});

const start = async () => {
   const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}`; // Constructing MongoDB connection URI
   const connectionDb = await mongoose.connect(mongoURI); // Establishing connection to MongoDB
   console.log(`MONGO connected DB host: ${connectionDb.connection.host}`); // Logging database connection confirmation

   server.listen(app.get("port"), () => {
      console.log(`Server is running on port ${app.get("port")}`); // Starting the server and logging confirmation
   });
};

start(); // Initializing the server and database connection
