import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [
    "http://localhost:5173",
];

// Security headers
app.use(helmet());

// CORS — only allow configured origins
app.use(
    cors({
        origin: CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many auth attempts, please try again later." },
});
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);

app.use("/api/v1/users", userRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
});

const start = async () => {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is not defined. Check your .env file.");
        process.exit(1);
    }

    const connectionDb = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${connectionDb.connection.host}`);

    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`${signal} received — shutting down`);
    await mongoose.connection.close();
    server.close(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();