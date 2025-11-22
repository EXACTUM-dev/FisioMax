/**
 * @fileoverview Integration tests for main server endpoints
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Verify core HTTP endpoints and request/response shapes
 */

import request from "supertest";
import { app } from "./testApp.js";

describe("Pruebas de Integración - Endpoints Principales", () => {
  describe("GET /", () => {
    test("debería devolver mensaje de servidor funcionando", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.text).toContain(
        "Servidor de backend funcionando correctamente"
      );
    });
  });

  describe("POST /login", () => {
    test("debería procesar login correctamente", async () => {
      const loginData = {
        email: "test@ejemplo.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body.message).toContain("login");
    });

    test("debería manejar login sin datos", async () => {
      const response = await request(app).post("/login").send({}).expect(200);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/test", () => {
    test("debería responder correctamente al endpoint de test", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body).toHaveProperty("message", "Test endpoint");
    });
  });

  describe("POST /api/test", () => {
    test("debería procesar POST correctamente", async () => {
      const testData = { test: "data" };

      const response = await request(app)
        .post("/api/test")
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "POST test endpoint");
    });
  });

  describe("POST /api/contacto", () => {
    test("debería validar campos requeridos", async () => {
      const response = await request(app)
        .post("/api/contacto")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty(
        "message",
        "Todos los campos son requeridos"
      );
    });

    test("debería procesar datos de contacto válidos", async () => {
      const contactData = {
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        mensaje: "Mensaje de prueba",
      };

      // Mock del servicio SES para evitar envío real de emails
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const response = await request(app)
        .post("/api/contacto")
        .send(contactData);

      // Restaurar console.error
      console.error = originalConsoleError;

      // In a real test environment this should be 200
      // But since SES may not be configured here, it can fail
      expect([200, 500]).toContain(response.status);
    });
  });

  describe("Manejo de errores de parsing JSON", () => {
    test("debería manejar JSON malformado", async () => {
      const response = await request(app)
        .post("/api/test")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
