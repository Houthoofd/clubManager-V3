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
import { statisticsRouter as statisticsRoutes } from "./modules/statistics/index.js";
import storeRoutes from "./modules/store/presentation/routes/storeRoutes.js";
import referencesRoutes from "./modules/references/presentation/routes/referencesRoutes.js";
import notificationRoutes from "./modules/notifications/presentation/routes/notificationRoutes.js";
import gradeRoutes from "./modules/grades/presentation/routes/gradeRoutes.js";
import recoveryRoutes from "./modules/recovery/presentation/routes/recoveryRoutes.js";
import reservationRoutes from "./modules/reservations/presentation/routes/reservationRoutes.js";
import groupRoutes from "./modules/groups/presentation/routes/groupRoutes.js";
import alertRoutes from "./modules/alerts/presentation/routes/alertRoutes.js";

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

  // CORS configuration — supporte plusieurs origines séparées par des virgules
  // + tous les ports localhost (pour les tests e2e dont le port est dynamique)
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Autoriser les requêtes sans origine (ex: curl, Postman, appels serveur-à-serveur)
      if (!origin) return callback(null, true);
      // Autoriser tous les ports localhost (tests e2e port dynamique)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origine non autorisée — ${origin}`));
    },
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
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/grades", gradeRoutes);
  app.use("/api/recovery", recoveryRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/groups", groupRoutes);

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

    // ── Determine HTTP status code ─────────────────────────────────────────
    // 1. If the error already has a statusCode/status (e.g. set by middleware)
    // 2. Map well-known domain error messages to proper HTTP codes
    // 3. Fall back to 500
    let statusCode: number = error.statusCode || error.status;

    if (!statusCode) {
      const msg: string = (error.message || "").toLowerCase();

      // 401 — authentication failures
      if (
        msg.includes("invalide") ||
        msg.includes("invalid") ||
        msg.includes("mot de passe") ||
        msg.includes("identifiant") ||
        msg.includes("not authenticated") ||
        msg.includes("unauthorized") ||
        msg.includes("not authorized") ||
        msg.includes("access denied") ||
        msg.includes("token") ||
        msg.includes("jwt")
      ) {
        statusCode = 401;
      }
      // 403 — forbidden
      else if (
        msg.includes("forbidden") ||
        msg.includes("interdit") ||
        msg.includes("permission") ||
        msg.includes("acc\u00e8s refus\u00e9")
      ) {
        statusCode = 403;
      }
      // 404 — not found
      else if (
        msg.includes("not found") ||
        msg.includes("introuvable") ||
        msg.includes("n'existe pas")
      ) {
        statusCode = 404;
      }
      // 409 — conflict (duplicate email, existing resource)
      else if (
        msg.includes("d\u00e9j\u00e0") ||
        msg.includes("already") ||
        msg.includes("duplicate") ||
        msg.includes("existe") ||
        msg.includes("associ\u00e9")
      ) {
        statusCode = 409;
      }
      // 422 / 400 — validation errors
      else if (
        msg.includes("requis") ||
        msg.includes("required") ||
        msg.includes("invalide") ||
        msg.includes("format") ||
        msg.includes("must be") ||
        msg.includes("doit") ||
        msg.includes("trop court") ||
        msg.includes("trop long")
      ) {
        statusCode = 422;
      }
      // Default
      else {
        statusCode = 500;
      }
    }

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
