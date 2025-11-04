/**
 * @fileoverview Integration tests for video access endpoint
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Tests video access control based on authentication, roles and privileges
 */

import { jest } from "@jest/globals";

/**
 * Mock Clerk middleware for authentication and role management
 * imulates Clerk authentication behavior by checking authorization headers:
 * - "valid_premium_token" → Premium user (user_premium_123)
 * - "suspended_user_token" → Suspended user (user_suspended_456)
 * - "basic_user_token" → Basic user (user_basic_789)
 * - No header or invalid token → 401 Unauthorized
 * 
 * @returns {object} Mocked Clerk module with authentication middleware
 */
jest.unstable_mockModule("@clerk/express", () => ({
  ClerkExpressRequireAuth: jest.fn(() => (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (authHeader.includes("valid_premium_token")) {
      req.auth = { userId: "user_premium_123" };
    } else if (authHeader.includes("suspended_user_token")) {
      req.auth = { userId: "user_suspended_456" };
    } else if (authHeader.includes("basic_user_token")) {
      req.auth = { userId: "user_basic_789" };
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }

    next();
  }),
  ClerkExpressWithAuth: jest.fn(() => (req, res, next) => next()),
}));

const { app } = await import("../../../server.js");
const request = (await import("supertest")).default;

describe("Video Access - Integration Tests", () => {
  beforeAll(() => {});

  afterAll(() => {
    jest.clearAllMocks();
  });

  /**
   * Scenario 1: Successful video access with adequate roles
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
   * Tests for User not authenticated attempts.
   * Verifies that requests without authentication tokens are properly rejected.
   * 
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
