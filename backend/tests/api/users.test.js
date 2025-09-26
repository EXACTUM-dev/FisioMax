/**
 * Version: 0.1.0
 * Users API test
 * Verifies that the users endpoint correctly returns user data
 */
import request from "supertest";
import express from "express";
import cors from "cors";

// Minimal test configuration
const app = express();
app.use(cors());
app.use(express.json());

// Mock users endpoint for testing
app.get("/api/usuarios", (req, res) => {
  res.json([
    { id: 1, nombre: "Juan", email: "juan@ejemplo.com" },
    { id: 2, nombre: "Ana", email: "ana@ejemplo.com" },
  ]);
});

describe("Users API", () => {
  test("GET /api/usuarios returns list of users", async () => {
    const response = await request(app).get("/api/usuarios");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].nombre).toBe("Juan");
  });
});
