import request from "supertest";
import express from "express";
import cors from "cors";

// Configuración mínima para pruebas
const app = express();
app.use(cors());
app.use(express.json());

// Mock de la ruta de usuarios para pruebas
app.get("/api/usuarios", (req, res) => {
  res.json([
    { id: 1, nombre: "Juan", email: "juan@ejemplo.com" },
    { id: 2, nombre: "Ana", email: "ana@ejemplo.com" },
  ]);
});

describe("API de Usuarios", () => {
  test("GET /api/usuarios devuelve lista de usuarios", async () => {
    const response = await request(app).get("/api/usuarios");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].nombre).toBe("Juan");
  });
});
