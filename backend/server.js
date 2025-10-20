/**
 * @fileoverview Main backend server application file.
 * @author EXACTUM-dev
 * @version 1.0.0
 */

// Import central configuration file
import config from "./config.js";

// Import required modules
import express from "express";
import cors from "cors";
import joi from "joi";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import { requireAuth } from "./src/middlewares/clerkAuth.js";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import usuariosRoutes from "./src/routes/users.routes.js";
import rolesRoutes from "./src/routes/roles.routes.js";

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
 * Test route to verify that the server is running.
 * @name GET /
 * @function
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
app.get("/", (req, res) => {
  res.send("¡Servidor de backend funcionando correctamente!");
});

//-------------------------
// PUBLIC ROUTES
//-------------------------

/**
 * Public login route - Does not require authentication.
 * @name POST /login
 * @function
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
app.post("/login", (req, res) => {
  // Authentication logic with Clerk would go here
  // For now, return an example response
  res.json({
    message: "Login endpoint - Public access",
    timestamp: new Date().toISOString(),
  });
});

//-------------------------
// PROTECTED ROUTES
//-------------------------

/**
 * Protected endpoint to get users - Requires authentication.
 * @name GET /api/usuarios
 * @function
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Array<Object>} List of users in JSON format.
 */
app.get("/api/usuarios", requireAuth, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { getUsuarios } = await import("./src/models/users.model.js");
    
    const users = await getUsuarios();

    res.json({
      message: "User list retrieved successfully",
      data: users,
      authenticatedUserId: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ 
      error: "Database query error",
      message: error.message 
    });
  }
});
app.post("/login", (req, res) => {
  // Aquí iría la lógica de autenticación con Clerk
  // Por ahora devolvemos una respuesta de ejemplo
  res.json({
    message: "Endpoint de login - Acceso público",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Example endpoint to send emails.
 * @name POST /api/contacto
 * @function
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Object} Success or error message.
 */
app.post("/api/contacto", async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // Validate required fields
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }
    const params = {
      Source: "trujillo_jaime@outlook.com", // Email verificado en SES
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Nuevo mensaje de contacto de ${nombre}`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `
Nombre: ${nombre}
Email: ${email}
Mensaje: ${mensaje}

Enviado desde: ${req.headers.host}
                        `,
            Charset: "UTF-8",
          },
          Html: {
            Data: `
<h3>Nuevo mensaje de contacto</h3>
<p><strong>Nombre:</strong> ${nombre}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Mensaje:</strong> ${mensaje}</p>
<p><strong>Enviado desde:</strong> ${req.headers.host}</p>
                        `,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Intenta nuevamente.",
    });
  }
});
/**
 * Admin route - Requires authentication and admin role.
 * @name GET /api/admin
 * @function
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
app.get("/api/admin", requireAuth, (req, res) => {
  // Simulate admin role verification
  const userRoles = req.auth?.sessionClaims?.metadata?.roles || [];
  if (!userRoles.includes("admin")) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  res.json({ message: "Panel de administración" });
});

// Test routes that generate different types of errors
app.get("/api/error/validation", (req, res, next) => {
  const error = new Error("Datos inválidos");
  error.name = "ValidationError";
  next(error);
});

app.get("/api/error/unauthorized", (req, res, next) => {
  const error = new Error("Token inválido");
  error.name = "UnauthorizedError";
  next(error);
});

app.get("/api/error/forbidden", (req, res, next) => {
  const error = new Error("Sin permisos");
  error.name = "ForbiddenError";
  next(error);
});

app.get("/api/error/internal", (req, res, next) => {
  const error = new Error("Error de base de datos");
  next(error);
});

app.get("/api/error/timeout", (req, res, next) => {
  const error = new Error("Timeout de conexión");
  error.code = "ETIMEDOUT";
  next(error);
});

app.get("/api/error/async", async (req, res, next) => {
  try {
    // Simulate async operation that fails
    await new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Error asíncrono")), 100);
    });
  } catch (error) {
    next(error);
  }
});
/**
 * Test endpoint.
 * @name GET /api/test
 * @function
 */
app.get("/api/test", (req, res) => {
  res.json({ message: "Test endpoint" });
});

/**
 * Test POST endpoint.
 * @name POST /api/test
 * @function
 */
app.post("/api/test", (req, res) => {
  res.json({ message: "POST test endpoint" });
});

/**
 * Body parser error test endpoint.
 * @name POST /api/error/body-parser
 * @function
 */
app.post("/api/error/body-parser", (req, res) => {
  // This route may fail if the body cannot be parsed
  res.json({ message: "Body parseado correctamente" });
});

/**
 * Sensitive data endpoint.
 * @name GET /api/sensitive
 * @function
 */
app.get("/api/sensitive", (req, res) => {
  res.json({
    message: "Datos sensibles",
    data: "información confidencial",
  });
});

// Middleware to handle JSON parsing errors
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

// Apply error handling middleware
app.use(secureErrorHandler);

// Export the application for use in tests
export { app };

//-------------------------
// START THE SERVER
//-------------------------
/**
 * Start the server and listen on the specified port.
 * Only runs if the file is executed directly (not in tests).
 */
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/roles", rolesRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(config.app.port, () => {
    console.log(
      `Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`
    );
  });
}
