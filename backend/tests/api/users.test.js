import { jest } from "@jest/globals";
import request from "supertest";

// Mock authentication and DB-user middlewares before importing server
jest.unstable_mockModule("../../src/middlewares/clerkAuth.js", () => ({
  requireAuth: (req, res, next) => next(),
  autoSyncClerkId: (req, res, next) => next(),
}));

jest.unstable_mockModule("../../src/middlewares/requireDbUser.js", () => ({
  requireDbUser: (req, res, next) => next(),
}));

const { app } = await import("../../server");
const { dbPool } = await import("../../config");

// Ensure dbPool.query is a jest mock so tests can control its resolution
dbPool.query = jest.fn();

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

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    // Controller responds with { success: true, data: users }
    expect(response.body.data).toEqual(mockUsers);
    expect(dbPool.query).toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    dbPool.query.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(500);
    // Controller returns an error structure with message
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error");
  });
});
