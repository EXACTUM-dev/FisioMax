/**
 * Test básico para verificar que la configuración de Jest funciona correctamente
 */
import express from "express";
import request from "supertest";

// Crea una app Express simple para testing
const app = express();

// Endpoint simple para probar
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
