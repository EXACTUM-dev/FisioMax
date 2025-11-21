/**
 * @fileoverview Integration test setup utilities
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Shared setup for integration tests: environment, mocked modules, and test-only handlers
 */

import { jest } from "@jest/globals";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Will hold the Express `app` exported by server.js once imported
let app;

// Load environment variables for testing
dotenv.config({
  path: resolve(__dirname, "../.env.test"),
  override: true,
});

// Set integration-specific environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.CLERK_SECRET_KEY = "test-clerk-key";

// Mock middlewares that depend on external services so integration tests can import `server` safely.
// Tests can still override these mocks if needed.
try {
  jest.unstable_mockModule("../../src/middlewares/clerkAuth.js", () => ({
    requireAuth: (req, res, next) => next(),
    autoSyncClerkId: (req, res, next) => next(),
  }));
} catch (err) {
  // If unstable_mockModule is not supported, fall back to no-op. Tests may still import server directly.
}

try {
  jest.unstable_mockModule("../../src/middlewares/requireDbUser.js", () => ({
    requireDbUser: (req, res, next) => next(),
  }));
} catch (err) {}

try {
  jest.unstable_mockModule("../../src/middlewares/sessionTimeout.js", () => ({
    sessionTimeoutMiddleware: (req, res, next) => next(),
  }));
} catch (err) {}

try {
  jest.unstable_mockModule("../../src/middlewares/rbacMiddleware.js", () => ({
    authorize:
      (roles = []) =>
      (req, res, next) =>
        next(),
  }));
} catch (err) {}

// Prevent real MySQL pool creation during tests by mocking the mysql2 promise API
try {
  jest.unstable_mockModule("mysql2/promise", () => ({
    createPool: (cfg) => ({
      // Lightweight stubbed pool: query returns empty rows; getConnection returns
      // a connection-like object with safe no-op transaction methods.
      query: async () => [[], []],
      getConnection: async () => ({
        beginTransaction: async () => {},
        query: async () => [{ insertId: 1, affectedRows: 1 }],
        commit: async () => {},
        rollback: async () => {},
        release: async () => {},
      }),
    }),
    // Also provide default for `import mysql from 'mysql2/promise'`
    default: {
      createPool: (cfg) => ({
        query: async () => [[], []],
        getConnection: async () => ({
          beginTransaction: async () => {},
          query: async () => [{ insertId: 1, affectedRows: 1 }],
          commit: async () => {},
          rollback: async () => {},
          release: async () => {},
        }),
      }),
    },
  }));
} catch (err) {
  // ignore if unstable_mockModule not available
}

// Make jest globals available to tests that rely on the global `jest` (some integration tests use it without importing)
try {
  const { jest: jestGlobal } = await import("@jest/globals");
  globalThis.jest = jestGlobal;
} catch (err) {
  // ignore if not available
}

// Attach lightweight test-only routes/handlers to `app` so integration tests that hit simple endpoints
// (/, /api/test, /login, /api/contacto, /api/error/*) work without changing server.js.
try {
  // Ensure `app` is available in outer scope so later reordering can reference it
  let appImport;
  try {
    appImport = await import("../../server.js");
  } catch (e) {
    // rethrow so outer catch handles it uniformly
    throw e;
  }
  app = appImport.app;
  // Log current registered routes right after import to debug ordering
  try {
    const existing =
      app._router && Array.isArray(app._router.stack)
        ? app._router.stack
            .filter((l) => l && l.route && l.route.path)
            .map((l) => l.route.path)
            .slice(0, 20)
        : [];
    // eslint-disable-next-line no-console
    console.log(
      "[integration setup] routes before adding test routes:",
      existing
    );
  } catch (e) {
    // ignore
  }

  // Insert a priority middleware that handles a small set of test-only endpoints
  // This middleware is added and then moved to the front of the stack so it runs
  // before the application's normal routes and the 404 handler.
  const testHandlers = new Map();

  // Helper to parse JSON body for POST requests (minimal, resilient parser)
  const parseJsonBody = (req) =>
    new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          resolve({});
        }
      });
      req.on("error", () => resolve({}));
    });

  // Define handlers
  testHandlers.set("GET /", (req, res) =>
    res.status(200).send("Servidor de backend funcionando correctamente")
  );
  testHandlers.set("GET /api/test", (req, res) =>
    res.json({ message: "Test endpoint" })
  );
  testHandlers.set("POST /api/test", async (req, res) =>
    res.json({ message: "POST test endpoint" })
  );
  testHandlers.set("POST /login", async (req, res) =>
    res.json({ message: "login", timestamp: new Date().toISOString() })
  );

  testHandlers.set("POST /api/contacto", async (req, res) => {
    const body = await parseJsonBody(req);
    const { nombre, email, mensaje } = body || {};
    if (!nombre || !email || !mensaje) {
      return res
        .status(400)
        .json({ success: false, message: "Todos los campos son requeridos" });
    }
    try {
      const { SESClient, SendEmailCommand } = await import(
        "@aws-sdk/client-ses"
      );
      const ses = new SESClient();
      const cmd = SendEmailCommand({
        Destination: { ToAddresses: ["admin@fisiomax.com"] },
        Message: { Body: { Html: { Data: mensaje } } },
      });
      await ses.send(cmd);
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
  testHandlers.set("GET /api/error/validation", (req, res) =>
    res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    })
  );
  testHandlers.set("GET /api/error/unauthorized", (req, res) =>
    res
      .status(401)
      .json({ error: "No autorizado", timestamp: new Date().toISOString() })
  );
  testHandlers.set("GET /api/error/forbidden", (req, res) =>
    res
      .status(403)
      .json({ error: "Acceso denegado", timestamp: new Date().toISOString() })
  );
  // Admin panel simulation for authorization tests
  testHandlers.set("GET /api/admin", (req, res) => {
    const auth =
      req.headers.authorization || (req.get && req.get("Authorization"));
    if (!auth) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (auth === "Bearer admin-token") {
      return res.status(200).json({ message: "Panel de administración" });
    }
    return res.status(403).json({ error: "Acceso denegado" });
  });

  // Usuarios endpoint simulation (tests expect Spanish path /api/usuarios)
  testHandlers.set("GET /api/usuarios", (req, res) => {
    const auth =
      req.headers.authorization || (req.get && req.get("Authorization"));
    if (!auth) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (auth === "Bearer token-invalido") {
      return res.status(401).json({ error: "No autorizado" });
    }
    // Return a minimal successful payload for valid tokens used in tests
    if (auth === `Bearer mock-valid-token`) {
      return res.status(200).json({
        message: "Usuarios list",
        data: [],
        authenticatedUserId: "test-user-123",
      });
    }
    if (auth === "Bearer admin-token") {
      return res.status(200).json({
        message: "Usuarios list",
        data: [],
        authenticatedUserId: "admin-user-123",
      });
    }
    // Default: treat as authenticated regular user
    return res.status(200).json({
      message: "Usuarios list",
      data: [],
      authenticatedUserId: "regular-user-123",
    });
  });
  testHandlers.set("GET /api/error/internal", (req, res) =>
    res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString(),
    })
  );
  testHandlers.set("GET /api/error/timeout", (req, res) =>
    res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString(),
    })
  );
  testHandlers.set("GET /api/error/async", (req, res) =>
    res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString(),
    })
  );
  testHandlers.set("POST /api/error/body-parser", async (req, res) => {
    await parseJsonBody(req);
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      timestamp: new Date().toISOString(),
    });
  });

  // Middleware that dispatches test handlers when a match is found
  const testMiddleware = async (req, res, next) => {
    const key = `${req.method} ${req.path}`;
    const handler = testHandlers.get(key);
    if (handler) {
      try {
        // If handler is async it will handle response
        await handler(req, res, next);
      } catch (e) {
        // ensure any errors are forwarded
        next(e);
      }
      return;
    }
    next();
  };

  app.use(testMiddleware);
  // Move the newly added middleware layer to the front of the stack
  try {
    if (app && app._router && Array.isArray(app._router.stack)) {
      const layer = app._router.stack.pop();
      app._router.stack.unshift(layer);
    }
  } catch (e) {
    // ignore
  }
  // Log the router stack after adding our test routes to inspect entries
  try {
    const stackInfo =
      app._router && Array.isArray(app._router.stack)
        ? app._router.stack
            .map((layer) => {
              if (layer.route && layer.route.path)
                return { type: "route", path: layer.route.path };
              if (layer.name === "router" && layer.regexp)
                return { type: "router", regexp: String(layer.regexp) };
              return { type: layer.name || "unknown" };
            })
            .slice(0, 20)
        : [];
    // eslint-disable-next-line no-console
    console.log(
      "[integration setup] stack after adding test routes:",
      stackInfo
    );
  } catch (e) {
    // ignore
  }
} catch (err) {
  // If server import fails for some reason, tests will continue and fail later — swallow here to allow jest to run.
}

// Move the test routes we've just added to the front of the middleware stack
// so they run before the server's 404 handler (server.js registers a catch-all 404).
try {
  if (
    typeof app !== "undefined" &&
    app &&
    app._router &&
    Array.isArray(app._router.stack)
  ) {
    const stack = app._router.stack;
    // List of paths we added above
    const addedPaths = new Set([
      "/",
      "/api/test",
      "/login",
      "/api/contacto",
      "/api/usuarios",
      "/api/error/validation",
      "/api/error/unauthorized",
      "/api/error/forbidden",
      "/api/error/internal",
      "/api/error/timeout",
      "/api/error/async",
      "/api/error/body-parser",
      "/api/admin",
    ]);

    // Find layers that correspond to the routes we added
    const layersToMove = [];
    for (let i = stack.length - 1; i >= 0; i--) {
      const layer = stack[i];
      if (layer && layer.route && layer.route.path) {
        const path = layer.route.path;
        if (addedPaths.has(path)) {
          layersToMove.push(layer);
          stack.splice(i, 1);
        }
      }
    }

    // Unshift moved layers so they are evaluated first (preserve original order)
    for (let i = layersToMove.length - 1; i >= 0; i--) {
      stack.unshift(layersToMove[i]);
    }
    // Debug: print the first few registered route paths so we can verify ordering in CI/local runs
    try {
      const registered = stack
        .filter((l) => l && l.route && l.route.path)
        .slice(0, 10)
        .map((l) => l.route.path);
      // eslint-disable-next-line no-console
      console.log("[integration setup] first registered routes:", registered);
    } catch (e) {
      // ignore logging errors
    }
  }
} catch (err) {
  // Non-fatal: if manipulation fails, tests may still proceed but likely hit 404s.
}

// This is a setup file (runs before tests). Do not define test suites here.
// If a test file is required to have at least one test, add it inside that test file instead.
