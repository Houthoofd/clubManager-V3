/**
 * server.ts
 * Point d'entrée principal du serveur Express
 */

import dotenv from "dotenv";
import createApp from "./app.js";
import { testConnection, closePool } from "./core/database/connection.js";

// Load environment variables
dotenv.config();

// Configuration
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Démarre le serveur
 */
const startServer = async (): Promise<void> => {
  try {
    console.log("=".repeat(60));
    console.log("🚀 ClubManager Backend v3.0.0");
    console.log("=".repeat(60));
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🔧 Node Version: ${process.version}`);
    console.log("=".repeat(60));

    // Test database connection
    console.log("🔍 Testing database connection...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ Database connection failed!");
      console.error("⚠️  Please check your database configuration.");
      process.exit(1);
    }

    console.log("✅ Database connection successful!");
    console.log("=".repeat(60));

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(PORT, HOST, () => {
      console.log("🎉 Server is running!");
      console.log(`📡 Listening on: http://${HOST}:${PORT}`);
      console.log(`🌐 API Base URL: http://${HOST}:${PORT}/api`);
      console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
      console.log("=".repeat(60));
      console.log("📝 Available Routes:");
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   POST   /api/auth/refresh`);
      console.log(`   POST   /api/auth/logout`);
      console.log(`   POST   /api/auth/logout-all`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   GET    /api/auth/health`);
      console.log("=".repeat(60));
      console.log("✨ Ready to accept requests!");
      console.log("=".repeat(60));
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log("\n" + "=".repeat(60));
      console.log(`⚠️  ${signal} received. Starting graceful shutdown...`);
      console.log("=".repeat(60));

      // Close server
      server.close(async () => {
        console.log("🔌 HTTP server closed");

        // Close database pool
        try {
          await closePool();
          console.log("🗄️  Database pool closed");
          console.log("=".repeat(60));
          console.log("✅ Graceful shutdown complete");
          console.log("👋 Goodbye!");
          console.log("=".repeat(60));
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("⚠️  Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error: Error) => {
      console.error("💥 Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("💥 Unhandled Rejection at:", promise);
      console.error("💥 Reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    console.error("=".repeat(60));
    console.error("❌ Failed to start server:");
    console.error(error);
    console.error("=".repeat(60));
    process.exit(1);
  }
};

// Start the server
startServer();
