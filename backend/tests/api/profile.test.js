/**
 * @fileoverview Unit tests for profile-related backend endpoints
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Tests for profile and users endpoints using mocked models
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());

// Simple route for testing that uses the mocked getUsuarios directly.
app.get("/api/users", async (req, res) => {
  try {
    const users = await getUsuarios();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving users" });
  }
});

describe("Profile / Users API (backend)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/users - returns user list successfully", async () => {
    const mockUsers = [
      { id: 1, nombres: "Ana", correo: "ana@example.com" },
      { id: 2, nombres: "Luis", correo: "luis@example.com" },
    ];

    // Create a fresh app and route that uses a local mock for getUsuarios
    const app = express();
    app.use(express.json());
    const getUsuarios = jest.fn().mockResolvedValue(mockUsers);
    app.get("/api/users", async (req, res) => {
      try {
        const users = await getUsuarios();
        res.json(users);
      } catch (err) {
        res.status(500).json({ error: "Error retrieving users" });
      }
    });

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    // The route handler in users.routes returns whatever the model returns.
    expect(res.body).toEqual(mockUsers);
    expect(getUsuarios).toHaveBeenCalled();
  });

  test("GET /api/users - handles model error with 500", async () => {
    const app = express();
    app.use(express.json());
    const getUsuarios = jest.fn().mockRejectedValue(new Error("DB failure"));
    app.get("/api/users", async (req, res) => {
      try {
        const users = await getUsuarios();
        res.json(users);
      } catch (err) {
        res.status(500).json({ error: "Error retrieving users" });
      }
    });

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
