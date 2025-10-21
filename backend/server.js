/**
 * @fileoverview Main backend server file for the application.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * @description Configures and starts the Express server with essential middlewares.
 */

import config from "./config.js";

import express from 'express';
import cors from 'cors';
import joi from 'joi';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import membershipApplicationRoutes from './src/routes/membershipApplication.routes.js';
import usuariosRoutes from '../backend/src/routes/usuarios.routes.js'

const app = express();

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

/**
 * Built-in Express middleware to process request body in JSON format.
 */
app.use(express.json());

/**
 * Built-in Express middleware to process URL-encoded form data.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * SES service configuration.
 */
// Configure SES
const sesClient = new SESClient({
  region: "us-east-2", // Cambia por tu región
});

/**
 * Test route to verify that the server is working.
 * @name GET /
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/", (req, res) => {
  res.send("¡Servidor de backend funcionando correctamente!");
});

/**
 * Public login route - No authentication required.
 * @name POST /login
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post("/login", (req, res) => {
  res.json({
    message: "Endpoint de login - Acceso público",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Protected endpoint to get users - Requires authentication.
 * @name GET /api/usuarios
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Array<Object>} List of users in JSON format.
 */

app.get("/api/usuarios", (req, res) => {
  console.log("Usuarios");
  const userId = req.auth?.userId;

  res.json({
    message: "Lista de usuarios obtenida exitosamente",
    data: [
      { id: 1, nombre: "Juan", email: "juan@ejemplo.com" },
      { id: 2, nombre: "Ana", email: "ana@ejemplo.com" },
    ],
    authenticatedUserId: userId,
    timestamp: new Date().toISOString(),
  });
});

app.post("/login", (req, res) => {

  res.json({
    message: "Endpoint de login - Acceso público",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Protected endpoint to get users - Requires authentication.
 * @name GET /api/usuarios
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Array<Object>} List of users in JSON format.
 */

app.get("/api/usuarios", (req, res) => {

  const userId = req.auth?.userId;

  res.json({
    message: "Lista de usuarios obtenida exitosamente",
    data: [
      { id: 1, nombre: "Juan", email: "juan@ejemplo.com" },
      { id: 2, nombre: "Ana", email: "ana@ejemplo.com" },
    ],
    authenticatedUserId: userId,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Example endpoint to send emails.
 * @name POST /api/contacto
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} Success/error operation message.
 */
app.post("/api/contacto", async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }
    const params = {
      Source: "trujillo_jaime@outlook.com",
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

app.get("/api/admin", (req, res) => {
  const userRoles = req.auth?.sessionClaims?.metadata?.roles || [];
  if (!userRoles.includes("admin")) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  res.json({ message: "Panel de administración" });
});

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
    await new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Error asíncrono")), 100);
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Test endpoint" });
});

app.post("/api/test", (req, res) => {
  res.json({ message: "POST test endpoint" });
});

app.post("/api/error/body-parser", (req, res) => {
  res.json({ message: "Body parseado correctamente" });
});

app.get("/api/sensitive", (req, res) => {
  res.json({
    message: "Datos sensibles",
    data: "información confidencial",
  });
});

/**
 * Routes for SOMEFIPP membership applications.
 */
app.use('/api/membership-applications', membershipApplicationRoutes);

app.use("/usuarios", usuariosRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Payload demasiado grande",
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
});

const secureErrorHandler = (err, req, res, next) => {
  console.error("Error interno:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });

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

  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
};


app.use(secureErrorHandler);

/**
 * Global middleware for handling uncaught errors.
 */
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Middleware for routes not found.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

export { app };

/**
 * Starts the server and makes it listen on the specified port.
 * Only executes if the file is run directly (not in tests).
 */
if (process.env.NODE_ENV !== "test") {
  app.listen(config.app.port, () => {
    console.log(
      `Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`
    );
  });
}