/**
 * @fileoverview Tests that verify the behavior of application middlewares
 * @version 1.0.1
 * @author EXACTUM-dev
 * @description Middleware integration tests (Helmet, CORS, compression, morgan, parsers)
 */

import request from "supertest";
import { app } from "./testApp.js";

describe("Pruebas de Integración - Middleware y Configuración", () => {
  describe("Middleware de seguridad (Helmet)", () => {
    test("debería incluir headers de seguridad", async () => {
      const response = await request(app).get("/").expect(200);

      // Veriffy basic headers
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
    });
  });

  describe("Middleware CORS", () => {
    test("debería manejar solicitudes CORS correctamente", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "http://localhost:3000")
        .expect(200);

      // Veriffy CORS configurated
      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    test("debería manejar preflight requests", async () => {
      const response = await request(app)
        .options("/api/test")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type")
        .expect(204);

      // Veriffy headers CORS in preflight
      expect(response.headers).toHaveProperty("access-control-allow-methods");
    });
  });

  describe("Middleware de compresión", () => {
    test("debería comprimir respuestas grandes", async () => {
      // Create big response
      const largeData = "x".repeat(1000);

      const response = await request(app)
        .post("/api/test")
        .send({ data: largeData })
        .expect(200);

      // In real environment, response is comprimed
      expect(response.headers).toHaveProperty("content-encoding");
    });
  });

  describe("Middleware de logging (Morgan)", () => {
    test("debería registrar solicitudes HTTP", async () => {
      const mockLog = jest.fn();
      // expose to the testApp so it can notify us when a request occurs
      global.__morganSpy = mockLog;

      await request(app).get("/").expect(200);

      expect(mockLog).toHaveBeenCalled();

      // cleanup
      delete global.__morganSpy;
    });
  });

  describe("Middleware de parsing JSON", () => {
    test("debería parsear JSON correctamente", async () => {
      const testData = { message: "test", number: 123 };

      const response = await request(app)
        .post("/api/test")
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "POST test endpoint");
    });

    test("debería manejar JSON vacío", async () => {
      const response = await request(app)
        .post("/api/test")
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty("message", "POST test endpoint");
    });
  });

  describe("Middleware de parsing URL-encoded", () => {
    test("debería parsear datos URL-encoded", async () => {
      const response = await request(app)
        .post("/api/test")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("message=test&number=123")
        .expect(200);

      expect(response.body).toHaveProperty("message", "POST test endpoint");
    });
  });

  describe("Configuración de la aplicación", () => {
    test("debería configurar Express correctamente", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.status).toBe(200);
      expect(response.text).toContain(
        "Servidor de backend funcionando correctamente"
      );
    });

    test("debería manejar diferentes tipos de contenido", async () => {
      const response = await request(app)
        .post("/api/test")
        .set("Content-Type", "application/json")
        .send({ test: "data" })
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Manejo de payloads grandes", () => {
    test("debería manejar payloads grandes", async () => {
      const largePayload = { data: "x".repeat(10000) };

      const response = await request(app)
        .post("/api/test")
        .send(largePayload)
        .expect(200);

      expect(response.body).toHaveProperty("message", "POST test endpoint");
    });
  });

  describe("Headers de respuesta", () => {
    test("debería incluir headers apropiados", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.headers).toHaveProperty("content-type");
      expect(response.headers["content-type"]).toContain("text/html");
    });
  });
});
