/**
 * Version: 0.1.1
 * Integration test for the ExerciseList component
 * Validates that exercises are fetched, rendered, and filtered correctly
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ExerciseList from "../../src/organisms/exerciseList";
import { exerciseApi } from "../../src/api/exerciseApi";

// Mock exerciseApi module
jest.mock("../../src/api/exerciseApi");

describe("ExerciseList Integration", () => {
  // Mock data for testing
  const mockExercises = [
    {
      id: 1,
      name: "Shoulder Press",
      category: "Upper Body",
      description: "Lift weights above your head with controlled movements",
      difficulty: "Intermediate",
      muscleGroups: ["Shoulders", "Triceps"],
    },
    {
      id: 2,
      name: "Squat",
      category: "Lower Body",
      description:
        "Bend your knees and lower your body as if sitting on a chair",
      difficulty: "Beginner",
      muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    },
  ];

  beforeEach(() => {
    // Mock API to return successful responses
    exerciseApi.getAll.mockResolvedValue(mockExercises);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads and displays exercises correctly", async () => {
    render(<ExerciseList />);

    // Wait for data to load
    await waitFor(() => {
      expect(exerciseApi.getAll).toHaveBeenCalled();
    });

    // Verify exercises are rendered
    expect(screen.getByText("Shoulder Press")).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();
  });

  test("filters exercises by category when a filter button is clicked", async () => {
    render(<ExerciseList />);

    await waitFor(() => {
      expect(screen.getByText("Shoulder Press")).toBeInTheDocument();
    });

    // Simulate filter button click
    const upperBodyButton = screen.getByText("Upper Body");
    fireEvent.click(upperBodyButton);

    // Verify API was called with filter
    await waitFor(() => {
      expect(exerciseApi.getAll).toHaveBeenCalledWith({
        category: "Upper Body",
      });
    });
  });
});
