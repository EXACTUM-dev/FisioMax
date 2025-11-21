/**
 * @fileoverview Minimal security test Express app
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Lightweight app mirroring production middlewares/endpoints for security tests
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

const app = express();

app.use(helmet());

const origins = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(compression({ threshold: 0 }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// No-op session timeout
app.use((req, res, next) => next());

// Expose a test hook for logging spies
app.use((req, res, next) => {
  try {
    if (typeof global.__morganSpy === "function") global.__morganSpy(req);
  } catch (e) {}
  next();
});

// Root endpoint (matches security tests expectation)
app.get("/", (req, res) => {
  res.status(200).send("¡Servidor de backend funcionando correctamente!");
});

app.get("/api/test", (req, res) => res.json({ message: "Test endpoint" }));

app.post("/api/test", (req, res) => {
  if (req.body && typeof req.body.data === "string") {
    return res.json({ message: "POST test endpoint", data: req.body.data });
  }
  return res.json({ message: "POST test endpoint" });
});

app.post("/login", (req, res) => {
  res.json({
    message: "Endpoint de login - Acceso público",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/usuarios", (req, res) =>
  res.status(401).json({ error: "No autorizado" })
);

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

// Error handlers similar to server.js
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
  if (res.headersSent) return next(err);
  return res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada" })
);

export { app };

// Dummy test to avoid Jest complaining when running this file as a suite
test("security helper noop", () => {
  expect(true).toBe(true);
});
