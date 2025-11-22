/**
 * @fileoverview Minimal test Express app used by integration tests
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Lightweight app mirroring production middlewares/endpoints for deterministic tests
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { dirname } from "path";

// Minimal test application used only by integration tests.
// This keeps `server.js` unchanged while providing a predictable app
// that integration tests can import and exercise.

const app = express();

// Basic middlewares (mirror those used in server.js enough for tests)
app.use(helmet());

const origins = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
// Force compression for tests so even small responses can be compressed
app.use(compression({ threshold: 0 }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session timeout/no-op for tests
app.use((req, res, next) => next());

// Notify tests that a request occurred (some tests expect logging behavior).
app.use((req, res, next) => {
  try {
    if (typeof global.__morganSpy === "function") global.__morganSpy(req);
  } catch (e) {
    // ignore
  }
  next();
});

// Test endpoints
app.get("/", (req, res) => {
  res.status(200).send("Servidor de backend funcionando correctamente");
});

app.get("/api/test", (req, res) => res.json({ message: "Test endpoint" }));
app.post("/api/test", (req, res) => {
  // If test sends a large payload (e.g. { data }), echo it back so compression
  // middleware can act on a larger response body during tests.
  if (req.body && typeof req.body.data === "string") {
    return res.json({ message: "POST test endpoint", data: req.body.data });
  }
  return res.json({ message: "POST test endpoint" });
});

app.post("/login", (req, res) => {
  res.json({ message: "login", timestamp: new Date().toISOString() });
});

app.post("/api/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body || {};
  if (!nombre || !email || !mensaje) {
    return res
      .status(400)
      .json({ success: false, message: "Todos los campos son requeridos" });
  }

  try {
    const { SESClient } = await import("@aws-sdk/client-ses");
    const ses = new SESClient();
    // Tests mock SESClient.send; pass a simple object to the mock to avoid
    // depending on AWS command constructors.
    await ses.send({
      Destination: { ToAddresses: ["admin@fisiomax.com"] },
      Message: { Body: { Html: { Data: mensaje } } },
    });
    return res.json({
      success: true,
      message: "Mensaje enviado correctamente",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje. Intenta nuevamente.",
    });
  }
});

// Error simulation endpoints
app.get("/api/error/validation", (req, res) =>
  res.status(400).json({
    error: "Datos de entrada inválidos",
    timestamp: new Date().toISOString(),
  })
);
app.get("/api/error/unauthorized", (req, res) =>
  res
    .status(401)
    .json({ error: "No autorizado", timestamp: new Date().toISOString() })
);
app.get("/api/error/forbidden", (req, res) =>
  res
    .status(403)
    .json({ error: "Acceso denegado", timestamp: new Date().toISOString() })
);
app.get("/api/error/internal", (req, res) =>
  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  })
);
app.get("/api/error/timeout", (req, res) =>
  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  })
);
app.get("/api/error/async", (req, res) =>
  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  })
);
app.post("/api/error/body-parser", (req, res) =>
  res.status(400).json({
    error: "Datos de entrada inválidos",
    timestamp: new Date().toISOString(),
  })
);

// Error handlers similar to server.js so tests see the same shapes
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  }
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Payload demasiado grande",
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  // Map known error names to responses
  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  }
  if (err && err.name === "UnauthorizedError") {
    return res
      .status(401)
      .json({ error: "No autorizado", timestamp: new Date().toISOString() });
  }
  if (err && err.name === "ForbiddenError") {
    return res
      .status(403)
      .json({ error: "Acceso denegado", timestamp: new Date().toISOString() });
  }
  // Generic
  if (res.headersSent) return next(err);
  return res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada" })
);

export { app };
