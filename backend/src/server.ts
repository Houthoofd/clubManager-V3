/**
 * @fileoverview Main Server Entry Point
 * @module server
 *
 * Express server configuration and startup.
 * Configures middleware, routes, error handling, and database connection.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createError from 'http-errors';

// Load environment variables
dotenv.config();

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Statistics Module
import { statisticsRouter } from './modules/statistics/index.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = '/api';

// ============================================================================
// EXPRESS APP CONFIGURATION
// ============================================================================

const app: Application = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

/**
 * Helmet - Security headers
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * CORS - Cross-Origin Resource Sharing
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ============================================================================
// GENERAL MIDDLEWARE
// ============================================================================

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Cookie parsing middleware
 */
app.use(cookieParser());

/**
 * HTTP request logger
 */
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * Health check endpoint
 * Returns server status and basic information
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '3.0.0',
    uptime: process.uptime(),
  });
});

/**
 * API root endpoint
 */
app.get(API_PREFIX, (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'ClubManager API v3',
    version: '3.0.0',
    documentation: '/api/docs',
    endpoints: {
      statistics: '/api/statistics',
      health: '/health',
    },
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Statistics Module Routes
 * Base path: /api/statistics
 */
app.use(`${API_PREFIX}/statistics`, statisticsRouter);

// TODO: Add other module routes as they are implemented
// app.use(`${API_PREFIX}/users`, usersRouter);
// app.use(`${API_PREFIX}/courses`, coursesRouter);
// app.use(`${API_PREFIX}/payments`, paymentsRouter);
// app.use(`${API_PREFIX}/store`, storeRouter);
// app.use(`${API_PREFIX}/messaging`, messagingRouter);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 Not Found handler
 * Catch all unhandled routes
 */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404, 'Resource not found'));
});

/**
 * Global error handler
 * Handles all errors thrown in the application
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Set locals, only providing error details in development
  const isDevelopment = NODE_ENV === 'development';
  const statusCode = err.statusCode || err.status || 500;

  // Log error in development
  if (isDevelopment) {
    console.error('Error:', err);
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      ...(isDevelopment && {
        stack: err.stack,
        details: err.details,
      }),
    },
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the Express server
 */
const startServer = async (): Promise<void> => {
  try {
    // TODO: Initialize database connection pool
    // await initializeDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log('========================================');
      console.log('ClubManager API v3');
      console.log('========================================');
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // TODO: Close database connections
    // await closeDatabase();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

startServer();

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export default app;
