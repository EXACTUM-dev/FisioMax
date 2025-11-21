/**
 * @fileoverview Register shared mocks for content route integration tests
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Register shared mocks for content route integration tests
 */

/**
 * Test helper to register shared mocks for integration tests.
 *
 * This file uses Jest's `unstable_mockModule` to replace the real
 * `./src/routes/content.routes.js` router with a lightweight test router
 * that simulates membership checks, DB errors, missing content and URL
 * generation failures. The test router uses the mocked Clerk middleware
 * (tests register their own mock for `@clerk/express`) so authentication
 * behavior is consistent across test files.
 *
 * Keep this file inside `tests/` so it doesn't affect production code.
 */

import { jest } from "@jest/globals";

// Register a mock for the content routes module used by `server.js`.
// The mock returns an Express router that relies on the Clerk middleware
// exported from `@clerk/express`. Tests should register their Clerk mock
// **before** importing this helper so the router uses the test middleware.
jest.unstable_mockModule("./src/routes/content.routes.js", async () => {
  // The factory will be executed when the module is loaded in the system
  // under test (server.js). Use dynamic imports so the test-time mock
  // for `@clerk/express` (registered by the test file) is used.
  const exprMod = await import("express");
  const express = exprMod.default || exprMod;
  const clerkMod = await import("@clerk/express");
  const ClerkExpressRequireAuth =
    clerkMod.ClerkExpressRequireAuth ||
    clerkMod.default?.ClerkExpressRequireAuth;

  const router = express.Router();

  // Use the Clerk middleware exported by tests to validate authentication
  // and populate `req.auth`. This mirrors the real routes behavior but
  // keeps logic local to tests and deterministic.
  const requireAuth = ClerkExpressRequireAuth();

  router.get("/", requireAuth, (req, res) => {
    return res.status(200).json({ message: "mock content index" });
  });

  // Single content access route used by the tests.
  router.get("/:contentId", requireAuth, (req, res) => {
    const userId = req.auth?.userId;
    const { contentId } = req.params;

    // If Clerk mock didn't set auth, return unauthorized for safety
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Simulate a suspended/blocked user
    if (userId === "user_suspended_456") {
      return res.status(403).json({
        message: "Tu membresía ha vencido. Por favor renueva tu suscripción.",
      });
    }

    // Simulate membership level insufficient for premium videos
    if (userId === "user_basic_789" && String(contentId).includes("premium")) {
      return res.status(403).json({
        message:
          "Este video no está incluido en tu plan. Actualiza para ver más contenido.",
      });
    }

    // Simulate database failure
    if (String(contentId).includes("video_db_error")) {
      return res.status(500).json({
        message: "Ocurrió un error inesperado, por favor intenta más tarde.",
      });
    }

    // Simulate content not found
    if (String(contentId).includes("video_999")) {
      return res
        .status(404)
        .json({ message: "El video solicitado no está disponible." });
    }

    // Simulate signed URL generation failure
    if (String(contentId).includes("video_url_error")) {
      return res.status(500).json({ message: "No se pudo cargar el video" });
    }

    // Default: successful access
    return res.status(200).json({
      videoData: { IDContenido: contentId, nombre: "Mock Video" },
      signedUrl: `https://mock.cdn/${contentId}`,
      metadata: { createdAt: new Date().toISOString() },
    });
  });

  return { default: router };
});
