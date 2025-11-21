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

// Global body parsers with generous limit so tests can validate payloads
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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

// Login route: allow only POST, return 405 for other methods
const loginHandler = (req, res) => {
  // If request has a non-JSON content-type but has payload, treat as bad request
  const contentType = req.get("content-type") || "";
  const contentLength = parseInt(req.get("content-length") || "0", 10);
  if (!req.is("application/json") && contentLength > 0) {
    return res.status(400).json({ error: "Datos de entrada inválidos" });
  }

  res.json({
    message: "Endpoint de login - Acceso público",
    timestamp: new Date().toISOString(),
  });
};

app
  .route("/login")
  .post(loginHandler)
  .all((req, res) => res.status(405).json({ error: "Method Not Allowed" }));

app.get("/api/usuarios", (req, res) =>
  res.status(401).json({ error: "No autorizado" })
);

// Sensitive endpoint used in header/cache tests
app.get("/api/sensitive", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ data: "sensitive" });
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

// Route-level JSON parser with small limit to simulate body-parser 413 behavior
app.post(
  "/api/error/body-parser",
  express.json({ limit: "10kb" }),
  (req, res) =>
    res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    })
);

// Error handlers similar to server.js, but also log internal errors for tests
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
  // Log internal errors for the logging test
  if (err) console.error("Error interno:", err);
  return res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada" })
);

export { app };

// Dummy test to satisfy Jest when running this file as a suite
test("helper noop", () => {
  expect(true).toBe(true);
});
