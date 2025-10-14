import request from "supertest";
import app from "../../server";
import { dbPool } from "../../config";

jest.mock("../../config", () => {
  const mockDbPool = {
    query: jest.fn(),
  };
  return { dbPool: mockDbPool };
});

describe("GET /api/usuarios", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of users", async () => {
    const mockUsers = [
      { id: 1, name: "Ana Gomez", email: "ana.gomez@example.com" },
      { id: 2, name: "Juan Perez", email: "juan.perez@example.com" },
    ];

    dbPool.query.mockResolvedValue([mockUsers]);

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(dbPool.query).toHaveBeenCalledWith("SELECT * FROM Usuario");
  });

  it("should handle database errors", async () => {
    dbPool.query.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Error al consultar la base de datos" });
  });
});
