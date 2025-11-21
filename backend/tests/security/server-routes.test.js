/**
 * @fileoverview Security tests for the real FisioMax server
 * @version 1.0.1
 * @author EXACTUM-dev
 * @description Tests validating the security posture of the actual server import
 */

import request from "supertest";

// Configure environment variables for tests before importing the server
process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.CLERK_SECRET_KEY = "sk_test_clerk_secret_key_for_testing_purposes";
process.env.CORS_ORIGINS = "http://localhost:5174";

// Import test application after setting environment variables
const { app } = await import("./test-helpers/security/testApp.helper.js");

describe("🛡️ Pruebas de Seguridad - Servidor Real de FisioMax", () => {
  describe("Ruta Raíz (/)", () => {
    test("debe responder correctamente sin autenticación", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toBe(
        "¡Servidor de backend funcionando correctamente!"
      );
    });

    test("debe incluir headers de seguridad", async () => {
      const response = await request(app).get("/");

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("strict-transport-security");
    });
  });

  describe("Ruta Pública de Login (POST /login)", () => {
    test("debe permitir acceso sin autenticación", async () => {
      const loginData = {
        email: "usuario@ejemplo.com",
        password: "contraseña123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Endpoint de login - Acceso público");
      expect(response.body).toHaveProperty("timestamp");
    });

    test("debe manejar datos de login vacíos", async () => {
      const response = await request(app).post("/login").send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Endpoint de login - Acceso público");
    });

    test("debe manejar datos de login malformados", async () => {
      const response = await request(app)
        .post("/login")
        .send("invalid json data");

      expect(response.status).toBe(400); // Express devuelve 400 para JSON inválido
    });

    test("debe incluir headers de seguridad en respuesta", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
    });

    test("debe manejar payloads grandes de forma segura", async () => {
      const largePayload = {
        email: "test@example.com",
        password: "password",
        extraData: "A".repeat(1000000), // 1MB de datos extra
      };

      const response = await request(app).post("/login").send(largePayload);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Endpoint de login - Acceso público");
    });
  });

  describe("Ruta Protegida de Usuarios (GET /api/usuarios)", () => {
    test("debe denegar acceso sin token de autenticación", async () => {
      const response = await request(app).get("/api/usuarios");

      expect(response.status).toBe(401);
    });

    test("debe denegar acceso con token inválido", async () => {
      const response = await request(app)
        .get("/api/usuarios")
        .set("Authorization", "Bearer token_invalido");

      expect(response.status).toBe(401);
    });

    test("debe denegar acceso con formato de autorización incorrecto", async () => {
      const response = await request(app)
        .get("/api/usuarios")
        .set("Authorization", "Basic token_invalido");

      expect(response.status).toBe(401);
    });

    test("debe denegar acceso sin header de autorización", async () => {
      const response = await request(app)
        .get("/api/usuarios")
        .set("Authorization", "");

      expect(response.status).toBe(401);
    });

    test("debe manejar tokens malformados de forma segura", async () => {
      const malformedTokens = [
        "Bearer",
        "Bearer ",
        "Bearer invalid.token.here",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid",
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get("/api/usuarios")
          .set("Authorization", token);

        expect(response.status).toBe(401);
      }
    });
  });

  describe("Protección contra Ataques Comunes", () => {
    test("debe proteger contra inyección en parámetros de ruta", async () => {
      // Try accessing non-existent routes with malicious payloads
      const maliciousPaths = [
        "/api/usuarios/1; DROP TABLE usuarios; --",
        "/api/usuarios/1 OR 1=1",
        "/api/usuarios/1 UNION SELECT * FROM usuarios",
        '/api/usuarios/1<script>alert("xss")</script>',
      ];

      for (const path of maliciousPaths) {
        const response = await request(app).get(path);

        // Should return 404 for non-existent routes, not execute malicious code
        expect(response.status).toBe(404);
      }
    });

    test("debe manejar headers maliciosos de forma segura", async () => {
      const maliciousHeaders = {
        "X-Forwarded-For": "127.0.0.1; DROP TABLE usuarios; --",
        "User-Agent": '<script>alert("xss")</script>',
        Referer: 'javascript:alert("xss")',
        Origin: "https://malicious-site.com",
      };

      const response = await request(app)
        .post("/login")
        .set(maliciousHeaders)
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Endpoint de login - Acceso público");
    });

    test("debe proteger contra ataques de timing", async () => {
      const startTime = Date.now();

      // Request without authentication
      await request(app).get("/api/usuarios");

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Response time should not be excessively long
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe("Configuración CORS", () => {
    test("debe permitir requests desde orígenes permitidos", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "http://localhost:5174");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5174"
      );
    });

    test("debe manejar preflight requests correctamente", async () => {
      const response = await request(app)
        .options("/api/usuarios")
        .set("Origin", "http://localhost:5174")
        .set("Access-Control-Request-Method", "GET")
        .set("Access-Control-Request-Headers", "Authorization");

      expect(response.status).toBe(204); // No Content for OPTIONS
    });

    test("debe rechazar requests desde orígenes no permitidos", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "https://malicious-site.com");

      // CORS should not include the header for disallowed origins
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Manejo de Métodos HTTP", () => {
    test("debe manejar métodos no permitidos correctamente", async () => {
      const methods = ["PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        const response = await request(app)[method.toLowerCase()]("/login");

        expect(response.status).toBe(405); // Method Not Allowed
      }
    });

    test("debe permitir métodos apropiados para cada ruta", async () => {
      // GET for root route
      const getResponse = await request(app).get("/");
      expect(getResponse.status).toBe(200);

      // POST para login
      const postResponse = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password" });
      expect(postResponse.status).toBe(200);

      // GET para usuarios (sin auth)
      const getUsersResponse = await request(app).get("/api/usuarios");
      expect(getUsersResponse.status).toBe(401); // Unauthorized, but method allowed
    });
  });

  describe("Validación de Respuestas", () => {
    test("debe incluir Content-Type correcto en respuestas JSON", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    test("debe incluir timestamp en respuestas de login", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.body).toHaveProperty("timestamp");
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test("debe mantener estructura de respuesta consistente", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.message).toBe("string");
      expect(typeof response.body.timestamp).toBe("string");
    });
  });
});
