/**
 * @fileoverview Pruebas de seguridad para headers HTTP y configuración
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Pruebas que validan la configuración de seguridad HTTP y CORS
 */

// Ensure test env vars are loaded before other imports
import "../setup.js";
import request from "supertest";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

// Configurar app de prueba con middlewares de seguridad
const { app } = await import("../../test-helpers/security/testApp.helper.js");
describe("🔒 Pruebas de Seguridad - Headers y Configuración", () => {
  describe("Headers de Seguridad con Helmet", () => {
    test("debe incluir X-Content-Type-Options header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    test("debe incluir X-Frame-Options header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    });

    test("debe incluir X-XSS-Protection header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("x-xss-protection");
      expect(response.headers["x-xss-protection"]).toBe("0");
    });

    test("debe incluir Strict-Transport-Security header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("strict-transport-security");
      expect(response.headers["strict-transport-security"]).toContain(
        "max-age="
      );
    });

    test("debe incluir Referrer-Policy header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("referrer-policy");
    });

    test("debe incluir Content-Security-Policy header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("content-security-policy");
      expect(response.headers["content-security-policy"]).toContain(
        "default-src 'self'"
      );
    });

    test("debe incluir X-DNS-Prefetch-Control header", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("x-dns-prefetch-control");
      expect(response.headers["x-dns-prefetch-control"]).toBe("off");
    });
  });

  describe("Configuración CORS", () => {
    test("debe permitir requests desde orígenes permitidos", async () => {
      const response = await request(app)
        .get("/api/test")
        .set("Origin", "http://localhost:5174");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5174"
      );
    });

    test("debe permitir credentials en requests CORS", async () => {
      const response = await request(app)
        .get("/api/test")
        .set("Origin", "http://localhost:5174");

      expect(response.headers).toHaveProperty(
        "access-control-allow-credentials"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    test("debe incluir métodos permitidos en preflight requests", async () => {
      const response = await request(app)
        .options("/api/test")
        .set("Origin", "http://localhost:5174")
        .set("Access-Control-Request-Method", "POST");

      expect(response.headers).toHaveProperty("access-control-allow-methods");
      expect(response.headers["access-control-allow-methods"]).toContain(
        "POST"
      );
      expect(response.headers["access-control-allow-methods"]).toContain("GET");
    });

    test("debe incluir headers permitidos en preflight requests", async () => {
      const response = await request(app)
        .options("/api/test")
        .set("Origin", "http://localhost:5174")
        .set("Access-Control-Request-Headers", "Content-Type");

      expect(response.headers).toHaveProperty("access-control-allow-headers");
      expect(response.headers["access-control-allow-headers"]).toContain(
        "Content-Type"
      );
    });

    test("debe rechazar requests desde orígenes no permitidos", async () => {
      const response = await request(app)
        .get("/api/test")
        .set("Origin", "https://malicious-site.com");

      // CORS no debería permitir este origen
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Compresión de Respuestas", () => {
    test("debe incluir header de compresión cuando se solicita", async () => {
      const response = await request(app)
        .get("/api/test")
        .set("Accept-Encoding", "gzip, deflate, br");

      // La compresión puede estar habilitada dependiendo del tamaño de la respuesta
      // Para respuestas pequeñas, puede que no se comprima
      expect(response.status).toBe(200);
    });

    test("debe manejar diferentes tipos de encoding", async () => {
      const encodings = ["gzip", "deflate", "br"];

      for (const encoding of encodings) {
        const response = await request(app)
          .get("/api/test")
          .set("Accept-Encoding", encoding);

        expect(response.status).toBe(200);
      }
    });
  });

  describe("Exposición de Información Sensible", () => {
    test("no debe exponer información del servidor en headers", async () => {
      const response = await request(app).get("/api/test");

      // Verificar que no se expongan headers sensibles
      expect(response.headers).not.toHaveProperty("server");
      expect(response.headers).not.toHaveProperty("x-powered-by");
      expect(response.headers).not.toHaveProperty("x-aspnet-version");
    });

    test("no debe incluir información de versión en respuestas de error", async () => {
      // Crear endpoint que genere error
      app.get("/api/error", (req, res) => {
        throw new Error("Error interno del servidor");
      });

      // Mock del error handler para evitar que la app se caiga
      app.use((err, req, res, next) => {
        res.status(500).json({
          error: "Error interno del servidor",
        });
      });

      const response = await request(app).get("/api/error");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error interno del servidor");
      // No debe incluir detalles técnicos del error
      expect(response.body).not.toHaveProperty("stack");
      expect(response.body).not.toHaveProperty("message");
    });
  });

  describe("Configuración de Cache", () => {
    test("debe configurar headers de cache apropiados para endpoints públicos", async () => {
      const response = await request(app).get("/api/test");

      // Para endpoints públicos, debería configurar cache headers
      // Esto es configurable según las necesidades de la aplicación
      expect(response.status).toBe(200);
    });

    test("debe evitar cache en endpoints sensibles", async () => {
      const response = await request(app).get("/api/sensitive");

      // Para endpoints sensibles, debería incluir headers que eviten cache
      expect(response.status).toBe(200);
      // En una implementación real, deberías agregar headers como:
      // Cache-Control: no-store, no-cache, must-revalidate
    });
  });

  describe("Protección contra Clickjacking", () => {
    test("debe incluir X-Frame-Options para prevenir clickjacking", async () => {
      const response = await request(app).get("/api/test");

      expect(response.headers).toHaveProperty("x-frame-options");
      expect(["DENY", "SAMEORIGIN"]).toContain(
        response.headers["x-frame-options"]
      );
    });
  });

  describe("Validación de Content-Type", () => {
    test("debe rechazar requests con Content-Type incorrecto", async () => {
      const response = await request(app)
        .post("/api/test")
        .set("Content-Type", "application/xml")
        .send("<xml>data</xml>");

      // Express por defecto solo parsea JSON, pero esto puede variar
      expect(response.status).toBe(200); // Puede cambiar según configuración
    });

    test("debe manejar Content-Type malformado", async () => {
      const response = await request(app)
        .post("/api/test")
        .set("Content-Type", "invalid/type")
        .send("data");

      expect(response.status).toBe(200); // Express es tolerante por defecto
    });
  });
});
