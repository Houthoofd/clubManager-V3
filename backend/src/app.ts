/**
 * app.ts
 * Configuration principale de l'application Express
 */

import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./modules/auth/presentation/routes/authRoutes.js";
import familyRoutes from "./modules/families/presentation/routes/familyRoutes.js";
import userRoutes from "./modules/users/presentation/routes/userRoutes.js";
import messagingRoutes from "./modules/messaging/presentation/routes/messagingRoutes.js";
import templateRoutes from "./modules/templates/presentation/routes/templateRoutes.js";

// Load environment variables
dotenv.config();

/**
 * Crée et configure l'application Express
 */
const createApp = (): Express => {
  const app = express();

  // ==================== SECURITY MIDDLEWARE ====================

  // Helmet pour sécuriser les headers HTTP
  app.use(helmet());

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // ==================== PARSING MIDDLEWARE ====================

  // Parse JSON bodies
  app.use(express.json({ limit: "10mb" }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Parse cookies
  app.use(cookieParser());

  // ==================== LOGGING MIDDLEWARE ====================

  // Morgan pour les logs HTTP
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // ==================== ROUTES ====================

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "ClubManager API is running",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  // API version endpoint
  app.get("/api", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      version: "3.0.0",
      name: "ClubManager API",
      description: "Clean Architecture REST API",
    });
  });

  // Mount auth routes
  app.use("/api/auth", authRoutes);
  app.use("/api/families", familyRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/messages", messagingRoutes);
  app.use("/api/templates", templateRoutes);

  // TODO: Mount other module routes
  // app.use("/api/courses", courseRoutes);
  // app.use("/api/payments", paymentRoutes);
  // app.use("/api/store", storeRoutes);

  // ==================== ERROR HANDLING ====================

  // 404 handler - Route not found
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.path,
      method: req.method,
    });
  });

  // Global error handler
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[Error Handler]", error);

    // Log stack trace in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Stack Trace]", error.stack);
    }

    // Determine status code
    const statusCode = error.statusCode || error.status || 500;

    // Send error response
    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
      ...(error.code && { code: error.code }),
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        error: error,
      }),
    });
  });

  return app;
};

export default createApp;
