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
import path from "path";

// Import routes
import authRoutes from "./modules/auth/presentation/routes/authRoutes.js";
import familyRoutes from "./modules/families/presentation/routes/familyRoutes.js";
import userRoutes from "./modules/users/presentation/routes/userRoutes.js";
import messagingRoutes from "./modules/messaging/presentation/routes/messagingRoutes.js";
import templateRoutes from "./modules/templates/presentation/routes/templateRoutes.js";
import settingsRoutes from "./modules/settings/presentation/routes/settingsRoutes.js";
import paymentRoutes from "./modules/payments/presentation/routes/paymentRoutes.js";
import courseRoutes from "./modules/courses/presentation/routes/courseRoutes.js";
import statisticsRoutes from "./modules/statistics/presentation/routes/statistics.routes.js";
import storeRoutes from "./modules/store/presentation/routes/storeRoutes.js";
import referencesRoutes from "./modules/references/presentation/routes/referencesRoutes.js";

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

  // Stripe webhook : raw body AVANT le parser JSON global
  // La vérification de signature Stripe nécessite le corps brut (Buffer non parsé)
  // Cette ligne doit impérativement précéder app.use(express.json())
  app.use(
    "/api/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
  );

  // Static files for local storage uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

  // Mount routes
  app.use("/api/auth", authRoutes);
  app.use("/api/families", familyRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/messages", messagingRoutes);
  app.use("/api/templates", templateRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/store", storeRoutes);
  app.use("/api/references", referencesRoutes);

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
