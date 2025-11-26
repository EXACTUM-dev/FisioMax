/**
 * @fileoverview Main backend server file for the application.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * @description Configures and starts the Express server with essential middlewares.
 */

import config from "./config.js";

import express from "express";
import cors from "cors";
import joi from "joi";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import membershipApplicationRoutes from "./src/routes/membershipApplication.routes.js";

import { requireAuth } from "./src/middlewares/clerkAuth.js";
import { requireDbUser } from "./src/middlewares/requireDbUser.js";
import { autoSyncClerkId } from "./src/middlewares/clerkAuth.js";
import { sessionTimeoutMiddleware } from "./src/middlewares/sessionTimeout.js";
import usuariosRoutes from "./src/routes/users.routes.js";
import rolesRoutes from "./src/routes/roles.routes.js";
import authRoutes from "./src/routes/auth.route.js";
import homePageRoutes from "./src/routes/homePage.route.js";
import loginLogsRoutes from "./src/routes/loginLogs.routes.js";
import notificationRoutes from './src/routes/notifications.routes.js';
import { startNotificationsCron } from './src/services/notificationCronJob.js';
import { startCleanupCron } from './src/services/cleanNotificationsCronJobs.js';
import statisticsRoutes from "./src/routes/statistics.routes.js";

// Initialize Express application
const app = express();

//---------------------------
// SECURITY MIDDLEWARE
//---------------------------
/**
 * Middleware to secure the application with HTTP headers.
 * @see {@link https://helmetjs.github.io/}
 */
app.use(helmet());

/**
 * Middleware to enable CORS (Cross-Origin Resource Sharing).
 * Uses configurations defined in config.js.
 * @see {@link https://expressjs.com/en/resources/middleware/cors.html}
 */
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

/**
 * Middleware to compress HTTP responses.
 * Reduces the size of data sent to the client.
 * @see {@link https://expressjs.com/en/resources/middleware/compression.html}
 */
app.use(compression());

/**
 * Middleware to log HTTP requests.
 * Useful for server logging and debugging.
 * @see {@link https://expressjs.com/en/resources/middleware/morgan.html}
 */
app.use(morgan("combined"));

//--------------------------------
// DATA PROCESSING MIDDLEWARE
//--------------------------------
/**
 * Built-in Express middleware to process request bodies in JSON format.
 */
app.use(express.json());

/**
 * Built-in Express middleware to process URL-encoded form data.
 */
app.use(express.urlencoded({ extended: true }));

//-------------------------
// SESSION TIMEOUT MIDDLEWARE
//-------------------------
/**
 * Middleware to track user activity and enforce 30-minute inactivity timeout.
 * Must be placed after authentication middleware (requireAuth) in protected routes.
 * Applies globally to track all authenticated requests.
 */
app.use(sessionTimeoutMiddleware);

/**
 * SES service configuration.
 */
// Configure AWS SES client
const sesClient = new SESClient({
  region: config.aws.region,
});

//-------------------------
// ROUTE DEFINITIONS
//-------------------------
/**
 * Routes for SOMEFIPP membership applications.
 */
app.use("/api/membership-applications", membershipApplicationRoutes);
app.use("/api/users", usuariosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logs", loginLogsRoutes);
app.use("/api/statistics", statisticsRoutes);
/**
 * Routes for video content access.
 */
import contentRoutes from "./src/routes/content.routes.js";
app.use("/api/content", contentRoutes);

/**
 * Routes for HomePage content (root path).
 */
app.use("/api", homePageRoutes);

/**  
 * Routes for notifications.
 */
app.use('/api/notifications', notificationRoutes);

/** 
 * Start Cron Job
 */
startNotificationsCron();
startCleanupCron();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Cron Jobs iniciados');
});

/**
 * Routes for payment processing with Mercado Pago.
 *  */
import paymentRoutes from "./src/routes/payment.routes.js";
app.use("/api/payments", paymentRoutes);
//-------------------------
// ERROR HANDLING MIDDLEWARE
// Order matters: JSON parsing errors -> Specific errors -> Generic errors -> 404
//-------------------------

/**
 * Middleware to handle JSON parsing errors
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Malformed JSON error
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  }
  if (err.type === "entity.too.large") {
    // Payload too large
    return res.status(413).json({
      error: "Payload demasiado grande",
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
});

/**
 * Secure error handler middleware.
 * Handles different types of errors and returns appropriate responses.
 * @param {Error} err - Error object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */
const secureErrorHandler = (err, req, res, next) => {
  // Log error for internal debugging (without exposing to client)
  console.error("Error interno:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });

  // Determine error type
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "No autorizado",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      error: "Acceso denegado",
      timestamp: new Date().toISOString(),
    });
  }

  // Generic error for internal server errors
  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Global middleware for handling uncaught errors.
 */
app.use(secureErrorHandler);

/**
 * Fallback error handler for any remaining errors
 */
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

/**
 * 404 Handler - Must be last after all routes and error handlers
 * Catches any requests that don't match defined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

export { app };

//-------------------------
// START THE SERVER
//-------------------------
/**
 * Start the server and listen on the specified port.
 * Only runs if the file is executed directly (not in tests).
 */

if (process.env.NODE_ENV !== "test") {
  app.listen(config.app.port, () => {
    console.log(
      `Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`
    );
  });
}
