/**
 * Version: 0.1.0
 * Exercise controller
 * Handles HTTP requests for exercise resources
 */
import exerciseModel from "../models/exerciseModel.js";

/**
 * Get all exercises with optional filtering
 */
export const getAllExercises = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const filters = {
      category: req.query.category,
      difficulty: req.query.difficulty,
      muscleGroup: req.query.muscleGroup,
    };

    const exercises = await exerciseModel.getAll(filters);
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error getting exercises:", error);
    res.status(500).json({ error: "Failed to retrieve exercises" });
  }
};

/**
 * Get a single exercise by ID
 */
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await exerciseModel.getById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error getting exercise:", error);
    res.status(500).json({ error: "Failed to retrieve exercise" });
  }
};

/**
 * Create a new exercise
 */
export const createExercise = async (req, res) => {
  try {
    // Validate required fields
    const { name, category, description } = req.body;
    if (!name || !category || !description) {
      return res.status(400).json({
        error: "Name, category and description are required",
      });
    }

    const newExercise = await exerciseModel.create(req.body);
    res.status(201).json(newExercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Failed to create exercise" });
  }
};

/**
 * Update an existing exercise
 */
export const updateExercise = async (req, res) => {
  try {
    const updatedExercise = await exerciseModel.update(req.params.id, req.body);

    if (!updatedExercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(updatedExercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    res.status(500).json({ error: "Failed to update exercise" });
  }
};

/**
 * Delete an exercise
 */
export const deleteExercise = async (req, res) => {
  try {
    const success = await exerciseModel.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting exercise:", error);
    res.status(500).json({ error: "Failed to delete exercise" });
  }
};
