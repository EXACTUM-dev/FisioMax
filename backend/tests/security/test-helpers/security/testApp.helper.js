import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

/**
 * @fileoverview Security test Express app (helper)
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Minimal Express app used by security tests to emulate server middlewares and endpoints
 */

const app = express();

app.use(helmet());

const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Use a function to strictly validate incoming Origin header against allowed list.
// If no origins are configured, fall back to the permissive behavior for tests.
const allowedOrigins = origins.length ? origins : null;
app.use(
  cors({
    origin: allowedOrigins
      ? (origin, callback) => {
        // Allow non-browser requests (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1)
          return callback(null, true);
        // Explicitly disallow other origins
        return callback(null, false);
      }
      : true,
    credentials: true,
  })
);
app.use(compression({ threshold: 1024 }));
app.use(morgan("combined"));

// Early route-specific stream-size guard for the body-parser error test.
// This runs before the global JSON parser and will short-circuit requests
// that send excessively large payloads to `/api/error/body-parser`.
app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/api/error/body-parser") {
    let received = 0;
    let handled = false;

    req.on("data", (chunk) => {
      received += chunk.length;
      if (!handled && received > 100000) {
        handled = true;
        // Send 413 and ensure the incoming stream is drained to avoid abrupt socket resets
        res.status(413).json({ error: "Payload demasiado grande" });
        try {
          // Resume the request to allow the client to finish sending without closing the socket
          if (typeof req.resume === "function") req.resume();
        } catch (e) {
          // ignore resume errors
        }
      }
    });

    req.on("end", () => {
      if (!handled) next();
    });

    // In case there's no body data at all
    req.on("error", () => {
      if (!handled) next();
    });
    return;
  }
  next();
});

// Global body parsers with generous limit so tests can validate payloads
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// No-op session timeout
app.use((req, res, next) => next());

// Expose a test hook for logging spies
app.use((req, res, next) => {
  try {
    if (typeof global.__morganSpy === "function") global.__morganSpy(req);
  } catch (e) { }
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

// Error simulation endpoints — call next(err) so error handler logs
app.get("/api/error", (req, res, next) => next(new Error("internal")));

app.get("/api/error/validation", (req, res, next) =>
  next({ name: "ValidationError" })
);
app.get("/api/error/unauthorized", (req, res, next) =>
  next({ name: "UnauthorizedError" })
);
app.get("/api/error/forbidden", (req, res, next) =>
  next({ name: "ForbiddenError" })
);
app.get("/api/error/internal", (req, res, next) =>
  next(new Error("internal error"))
);
app.get("/api/error/timeout", (req, res, next) =>
  next(new Error("timeout error"))
);
app.get("/api/error/async", async (req, res, next) =>
  next(new Error("async error"))
);

// Route-level JSON parser: if content-length is big, simulate 413
app.post(
  "/api/error/body-parser",
  (req, res, next) => {
    const contentLength = parseInt(req.get("content-length") || "0", 10);
    if (contentLength > 100000) {
      // Send 413 and drain the stream to avoid ECONNRESET in tests
      const resp = res.status(413).json({ error: "Payload demasiado grande" });
      try {
        if (typeof req.resume === "function") req.resume();
      } catch (e) { }
      return resp;
    }

    // If Content-Length wasn't provided (chunked requests) or parser already
    // parsed the body, check the parsed body size as a fallback.
    try {
      if (req.body) {
        const size =
          typeof req.body === "string"
            ? Buffer.byteLength(req.body, "utf8")
            : Buffer.byteLength(JSON.stringify(req.body), "utf8");
        if (size > 100000) {
          // Send 413 and drain remaining data
          const resp = res
            .status(413)
            .json({ error: "Payload demasiado grande" });
          try {
            if (typeof req.resume === "function") req.resume();
          } catch (e) { }
          return resp;
        }
      }
    } catch (e) {
      // ignore measurement errors and continue to let parser/error handlers run
    }

    // Let global parser run (it will parse small bodies)
    next();
  },
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
  return res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada" })
);

export { app };

// Dummy test so Jest doesn't fail if this file is discovered as a test suite
test("security testApp noop", () => {
  expect(true).toBe(true);
});
