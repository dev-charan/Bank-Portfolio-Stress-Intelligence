import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";
import { logger } from "./utils/logger";

const PORT = config.port;

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info("Shutting down gracefully...");

  try {
    await prisma.$disconnect();
    logger.success("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.success("Database connected successfully");

    app.listen(PORT, () => {
      logger.success(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API URL: http://localhost:${PORT}`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
