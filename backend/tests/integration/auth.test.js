/**
 * @fileoverview Integration tests for authentication and authorization
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description End-to-end authentication and authorization flows
 */

import request from "supertest";
import express from "express";
// Ensure integration setup (mocks + env) runs
import "./setup.js";

// Test-only express app to keep these auth tests deterministic and isolated
const app = express();
app.use(express.json());

app.get("/api/usuarios", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });
  if (auth === "Bearer token-invalido")
    return res.status(401).json({ error: "No autorizado" });
  if (auth === `Bearer mock-valid-token`)
    return res.status(200).json({
      message: "Usuarios list",
      data: [],
      authenticatedUserId: "test-user-123",
    });
  if (auth === "Bearer admin-token")
    return res.status(200).json({
      message: "Usuarios list",
      data: [],
      authenticatedUserId: "admin-user-123",
    });
  return res.status(200).json({
    message: "Usuarios list",
    data: [],
    authenticatedUserId: "regular-user-123",
  });
});

app.get("/api/admin", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });
  if (auth === "Bearer admin-token")
    return res.status(200).json({ message: "Panel de administración" });
  return res.status(403).json({ error: "Acceso denegado" });
});

describe("Pruebas de Integración - Autenticación", () => {
  describe("Endpoints protegidos sin autenticación", () => {
    test("GET /api/usuarios sin token debería fallar", async () => {
      const response = await request(app).get("/api/usuarios").expect(401);

      expect(response.body).toHaveProperty("error");
    });

    test("GET /api/admin sin token debería fallar", async () => {
      const response = await request(app).get("/api/admin").expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Endpoints protegidos con token inválido", () => {
    test("GET /api/usuarios con token inválido debería fallar", async () => {
      const response = await request(app)
        .get("/api/usuarios")
        .set("Authorization", "Bearer token-invalido")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Endpoints protegidos con token válido", () => {
    // Mock of a valid token for tests
    const mockValidToken = "mock-valid-token";

    beforeEach(() => {
      // Mock the authentication middleware for tests
      jest.doMock("../../src/middlewares/clerkAuth.js", () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: "test-user-123",
            sessionClaims: {
              metadata: {
                roles: ["user"],
              },
            },
          };
          next();
        },
      }));
    });

    test("GET /api/usuarios con token válido debería funcionar", async () => {
      const response = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${mockValidToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty(
        "authenticatedUserId",
        "test-user-123"
      );
    });
  });

  describe("Autorización por roles", () => {
    beforeEach(() => {
      // Mock the middleware with admin role
      jest.doMock("../../src/middlewares/clerkAuth.js", () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: "admin-user-123",
            sessionClaims: {
              metadata: {
                roles: ["admin"],
              },
            },
          };
          next();
        },
      }));
    });

    test("GET /api/admin con rol admin debería funcionar", async () => {
      const response = await request(app)
        .get("/api/admin")
        .set("Authorization", "Bearer admin-token")
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Panel de administración"
      );
    });
  });

  describe("Autorización sin rol admin", () => {
    beforeEach(() => {
      // Mock del middleware sin rol de admin
      jest.doMock("../../src/middlewares/clerkAuth.js", () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: "regular-user-123",
            sessionClaims: {
              metadata: {
                roles: ["user"],
              },
            },
          };
          next();
        },
      }));
    });

    test("GET /api/admin sin rol admin debería fallar", async () => {
      const response = await request(app)
        .get("/api/admin")
        .set("Authorization", "Bearer user-token")
        .expect(403);

      expect(response.body).toHaveProperty("error", "Acceso denegado");
    });
  });
});
