/**
 * @fileoverview Pruebas de seguridad para manejo de errores
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Pruebas que validan el manejo seguro de errores y excepciones
 */

import request from "supertest";
import express from "express";

// Configurar app de prueba
const { app } = await import("../../test-helpers/security/testApp.helper.js");
describe("⚠️ Pruebas de Seguridad - Manejo de Errores", () => {
  describe("Exposición de Información Sensible", () => {
    test("no debe exponer stack traces en respuestas de error", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
      expect(response.body).not.toHaveProperty("stack");
      expect(response.body).not.toHaveProperty("message");
      expect(response.body).not.toHaveProperty("details");
    });

    test("no debe exponer información del sistema en errores de validación", async () => {
      const response = await request(app).get("/api/error/validation");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Datos de entrada inválidos");
      expect(response.body).not.toHaveProperty("stack");
      expect(response.body).not.toHaveProperty("message");
    });

    test("no debe exponer rutas internas en mensajes de error", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.status).toBe(500);
      expect(response.body.error).not.toContain("/src/");
      expect(response.body.error).not.toContain("node_modules");
      expect(response.body.error).not.toContain("\\");
    });

    test("no debe exponer información de base de datos en errores", async () => {
      const response = await request(app).get("/api/error/timeout");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
      expect(response.body).not.toHaveProperty("code");
      expect(response.body).not.toHaveProperty("errno");
    });
  });

  describe("Códigos de Estado HTTP Apropiados", () => {
    test("debe devolver 400 para errores de validación", async () => {
      const response = await request(app).get("/api/error/validation");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Datos de entrada inválidos");
    });

    test("debe devolver 401 para errores de autenticación", async () => {
      const response = await request(app).get("/api/error/unauthorized");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("No autorizado");
    });

    test("debe devolver 403 para errores de autorización", async () => {
      const response = await request(app).get("/api/error/forbidden");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Acceso denegado");
    });

    test("debe devolver 500 para errores internos del servidor", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
    });
  });

  describe("Manejo de Errores Asíncronos", () => {
    test("debe manejar errores de promesas rechazadas", async () => {
      const response = await request(app).get("/api/error/async");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
      expect(response.body).not.toHaveProperty("stack");
    });

    test("debe incluir timestamp en respuestas de error", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("timestamp");
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe("Manejo de Errores de Parsing", () => {
    test("debe manejar JSON malformado de forma segura", async () => {
      const response = await request(app)
        .post("/api/error/body-parser")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      // Express debería manejar esto internamente
      expect(response.status).toBe(400); // Bad Request por JSON inválido
    });

    test("debe manejar payloads excesivamente grandes", async () => {
      const largePayload = "a".repeat(1000000); // 1MB de datos

      const response = await request(app)
        .post("/api/error/body-parser")
        .set("Content-Type", "application/json")
        .send(`"${largePayload}"`);

      // El servidor debería manejar esto apropiadamente
      expect(response.status).toBe(413);
    });
  });

  describe("Logging Seguro", () => {
    test("debe registrar errores sin exponer información sensible", () => {
      // Mock console.error para capturar logs
      const originalConsoleError = console.error;
      let loggedError = null;

      console.error = (...args) => {
        loggedError = args;
      };

      // Hacer request que genere error
      request(app)
        .get("/api/error/internal")
        .then(() => {
          // Verificar que el error se logueó internamente
          expect(loggedError).toBeTruthy();
          expect(loggedError[0]).toBe("Error interno:");

          // Restaurar console.error
          console.error = originalConsoleError;
        });
    });
  });

  describe("Manejo de Errores de Timeout", () => {
    test("debe manejar timeouts de forma segura", async () => {
      const response = await request(app).get("/api/error/timeout");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
      expect(response.body).not.toHaveProperty("code");
    });
  });

  describe("Consistencia de Respuestas de Error", () => {
    test("debe mantener formato consistente en todos los errores", async () => {
      const errorTypes = [
        "/api/error/validation",
        "/api/error/unauthorized",
        "/api/error/forbidden",
        "/api/error/internal",
      ];

      for (const endpoint of errorTypes) {
        const response = await request(app).get(endpoint);

        expect(response.body).toHaveProperty("error");
        expect(response.body).toHaveProperty("timestamp");
        expect(typeof response.body.error).toBe("string");
        expect(typeof response.body.timestamp).toBe("string");
      }
    });
  });

  describe("Protección contra Information Disclosure", () => {
    test("no debe revelar versión de Node.js en errores", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.body.error).not.toContain("node");
      expect(response.body.error).not.toContain("v18");
      expect(response.body.error).not.toContain("v20");
    });

    test("no debe revelar información del sistema operativo", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.body.error).not.toContain("windows");
      expect(response.body.error).not.toContain("linux");
      expect(response.body.error).not.toContain("darwin");
    });

    test("no debe revelar rutas de archivos del servidor", async () => {
      const response = await request(app).get("/api/error/internal");

      expect(response.body.error).not.toContain("C:\\");
      expect(response.body.error).not.toContain("/home/");
      expect(response.body.error).not.toContain("/usr/");
    });
  });
});
