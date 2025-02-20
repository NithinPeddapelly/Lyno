import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

const app = express(); // Creating an instance of Express
const server = createServer(app); // Creating an HTTP server and integrating it with Express
const io = new Server(server); // Setting up a new Socket.IO server instance

app.set("port", process.env.PORT || 8000); // Setting the port for the server (default: 8000)
app.get("/home", (req, res) => {
   // Defining a simple GET route at "/home"
   return res.json({ hello: "world12" }); // Responds with a JSON object containing "hello": "world"
});

const start = async () => {
  
   // Function to start the server
   server.listen(app.get("port"), () => {
      console.log("Server is running on port 8000"); // Listening on port 8000 and logging confirmation
   });
};

start(); // Calling the start function to initialize the server
