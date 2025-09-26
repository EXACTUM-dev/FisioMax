/**
 * Version: 0.1.0
 * Exercise API tests
 * Tests for the exercise API endpoints
 */
import request from "supertest";
import express from "express";
import cors from "cors";
import exerciseRoutes from "../../src/routes/exerciseRoutes.js";

// Create test Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/exercises", exerciseRoutes);

describe("Exercise API", () => {
  test("GET /api/exercises returns all exercises", async () => {
    const response = await request(app).get("/api/exercises");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty("name");
    expect(response.body[0]).toHaveProperty("category");
  });

  test("GET /api/exercises/:id returns specific exercise", async () => {
    const response = await request(app).get("/api/exercises/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("name", "Shoulder Press");
  });

  test("GET /api/exercises with category filter returns filtered exercises", async () => {
    const response = await request(app).get("/api/exercises?category=Core");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].category).toBe("Core");
  });

  test("POST /api/exercises creates new exercise", async () => {
    const newExercise = {
      name: "Push-up",
      category: "Upper Body",
      description: "Classic upper body exercise",
      difficulty: "Beginner",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
    };

    const response = await request(app)
      .post("/api/exercises")
      .send(newExercise);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Push-up");
  });
});
