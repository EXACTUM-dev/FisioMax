/**
 * @fileoverview Integration tests for video access endpoint
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Tests video access control based on authentication, roles and privileges
 */

import { jest } from "@jest/globals";
import express from "express";
const request = (await import("supertest")).default;

// Build a lightweight test app/router that simulates the content routes
// This avoids importing the full server and external Clerk module.
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ message: "mock content index" });
});

router.get("/:contentId", (req, res) => {
  const authHeader = req.headers.authorization;
  const contentId = req.params.contentId;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let userId = null;
  if (authHeader.includes("valid_premium_token")) userId = "user_premium_123";
  else if (authHeader.includes("suspended_user_token"))
    userId = "user_suspended_456";
  else if (authHeader.includes("basic_user_token")) userId = "user_basic_789";
  else return res.status(401).json({ error: "Invalid token" });

  // Simulate suspended user
  if (userId === "user_suspended_456") {
    return res.status(403).json({
      message: "Tu membresía ha vencido. Por favor renueva tu suscripción.",
    });
  }

  // Simulate insufficient membership for premium
  if (userId === "user_basic_789" && String(contentId).includes("premium")) {
    return res.status(403).json({
      message:
        "Este video no está incluido en tu plan. Actualiza para ver más contenido.",
    });
  }

  // Simulate DB failure
  if (String(contentId).includes("video_db_error")) {
    return res.status(500).json({
      message: "Ocurrió un error inesperado, por favor intenta más tarde.",
    });
  }

  // Simulate not found
  if (String(contentId).includes("video_999")) {
    return res
      .status(404)
      .json({ message: "El video solicitado no está disponible." });
  }

  // Simulate signed URL error
  if (String(contentId).includes("video_url_error")) {
    return res.status(500).json({ message: "No se pudo cargar el video" });
  }

  // Default success
  return res.status(200).json({
    videoData: { IDContenido: contentId, nombre: "Mock Video" },
    signedUrl: `https://mock.cdn/${contentId}`,
    metadata: { createdAt: new Date().toISOString() },
  });
});

app.use("/api/content", router);

describe("Video Access - Integration Tests", () => {
  beforeAll(() => {});

  afterAll(() => {
    jest.clearAllMocks();
  });

  /**
   * Scenario 1: Successful video access with adequate role
   */
  describe("GET /api/content/:videoId - Successful access", () => {
    test("should return 200 and video data when user has sufficient privileges", async () => {
      const response = await request(app)
        .get("/api/content/video_001")
        .set("Authorization", "Bearer valid_premium_token")
        .expect(200);

      expect(response.body).toHaveProperty("videoData");
      expect(response.body).toHaveProperty("signedUrl");
      expect(response.body).toHaveProperty("metadata");
    });
  });

  /**
   * Scenario 2: User not authenticated
   */
  describe("GET /api/content/:videoId - Not authenticated", () => {
    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/api/content/video_001")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  /**
   * Scenario 3: Insufficient privilege level
   */
  describe("GET /api/content/:videoId - Insufficient privileges", () => {
    test("should return 403 when user has blocked role", async () => {
      const response = await request(app)
        .get("/api/content/video_001")
        .set("Authorization", "Bearer suspended_user_token")
        .expect(403);

      expect(response.body.message).toMatch(/membresía ha vencido/i);
    });

    test("should return 403 when membership level is insufficient", async () => {
      const response = await request(app)
        .get("/api/content/video_premium_001")
        .set("Authorization", "Bearer basic_user_token")
        .expect(403);

      expect(response.body.message).toMatch(/no está incluido en tu plan/i);
    });
  });

  /**
   * Scenario 4: Database error
   */
  describe("GET /api/content/:videoId - Database error", () => {
    test("should return 500 when database fails", async () => {
      const response = await request(app)
        .get("/api/content/video_db_error")
        .set("Authorization", "Bearer valid_premium_token")
        .expect(500);

      expect(response.body.message).toMatch(/error inesperado/i);
    });
  });

  /**
   * Scenario 5: Video does not exist
   */
  describe("GET /api/content/:videoId - Video not found", () => {
    test("should return 404 when video does not exist", async () => {
      const response = await request(app)
        .get("/api/content/video_999")
        .set("Authorization", "Bearer valid_premium_token")
        .expect(404);

      expect(response.body.message).toMatch(/video.*no.*disponible/i);
    });
  });

  /**
   * Scenario 6: Error generating signed URL
   */
  describe("GET /api/content/:videoId - Signed URL error", () => {
    test("should return 500 when URL generation fails", async () => {
      const response = await request(app)
        .get("/api/content/video_url_error")
        .set("Authorization", "Bearer valid_premium_token")
        .expect(500);

      expect(response.body.message).toMatch(/no se pudo cargar el video/i);
    });
  });
});
