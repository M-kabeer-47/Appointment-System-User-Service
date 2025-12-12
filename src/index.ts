import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

// Routes
app.use("/api/auth", authRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 User Service running on port ${config.port}`);
});
