import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/users.routes.js";
import { env } from "./config/env.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// Needed behind Render/proxies so rate-limit and IP logic are reliable.
app.set("trust proxy", 1);

const normalizedAllowedOrigins = env.CORS_ORIGIN
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
        if (origin === "*") return "*";
        try {
            return new URL(origin).origin;
        } catch {
            return origin.replace(/\/+$/, "");
        }
    });

// Security headers
app.use(helmet());

// CORS — only allow configured origins
const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        const requestOrigin = (() => {
            try {
                return new URL(origin).origin;
            } catch {
                return origin.replace(/\/+$/, "");
            }
        })();

        if (normalizedAllowedOrigins.includes("*") || normalizedAllowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));

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
    try {
        const connectionDb = await mongoose.connect(env.MONGODB_URI);
        console.log(`MongoDB connected: ${connectionDb.connection.host}`);

        server.listen(env.PORT, () => {
            console.log(`Server listening on port ${env.PORT}`);
        });
    } catch (error) {
        console.error(error.message || "Failed to start server.");
        process.exit(1);
    }
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