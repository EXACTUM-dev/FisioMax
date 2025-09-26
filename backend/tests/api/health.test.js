/**
 * Version: 0.1.0
 * Health API test
 * Basic test to verify Jest configuration is working correctly
 */
import express from "express";
import request from "supertest";

// Create simple Express app for testing
const app = express();

// Simple endpoint for testing
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is working correctly" });
});

describe("API Health Check", () => {
  test("GET /api/health returns status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("message");
  });
});
