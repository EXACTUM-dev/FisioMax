/**
 * @fileoverview API Health Check test
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Basic health-check test to verify Jest and Express setup
 */
import express from "express";
import request from "supertest";

// Create a simple Express app for testing
const app = express();

// Simple test endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API está funcionando correctamente" });
});

describe("API Health Check", () => {
  test("GET /api/health devuelve status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("message");
  });
});
