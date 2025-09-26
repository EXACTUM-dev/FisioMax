/**
 * Version: 0.1.0
 * Exercise routes
 * Defines API endpoints for exercise resources
 */
import express from "express";
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

// GET /api/exercises - Get all exercises with optional filtering
router.get("/", getAllExercises);

// GET /api/exercises/:id - Get a specific exercise by ID
router.get("/:id", getExerciseById);

// POST /api/exercises - Create a new exercise
router.post("/", createExercise);

// PUT /api/exercises/:id - Update an existing exercise
router.put("/:id", updateExercise);

// DELETE /api/exercises/:id - Delete an exercise
router.delete("/:id", deleteExercise);

export default router;
