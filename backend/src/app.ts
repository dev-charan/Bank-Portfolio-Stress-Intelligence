// src/app.ts
import express, { Application } from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

// Import routes
import bankRoutes from "./routes/bankRoutes";
import borrowerRoutes from "./routes/borrowerRoutes";
import recordRoutes from "./routes/recordRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import metricsRoutes from './routes/metricsRoutes'; 

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Bank Risk Intelligence API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes - ADD THESE IN THIS EXACT ORDER
app.use("/api/banks", bankRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricsRoutes);
// Error handling - MUST BE LAST
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
