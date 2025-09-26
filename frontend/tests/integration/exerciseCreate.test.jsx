/**
 * Version: 1.0.1
 * Integration test for exercise creation feature
 * Validates the flow of creating a new exercise and checks API interactions
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExerciseTestPage from "../../src/pages/exerciseTestPage";
import { exerciseApi } from "../../src/api/exerciseApi";

// Mock API module
jest.mock("../../src/api/exerciseApi");

// Mock Clerk UserButton
jest.mock("@clerk/clerk-react", () => ({
  UserButton: () => <button data-testid="user-button">User</button>,
}));

describe("Exercise Creation Integration", () => {
  beforeEach(() => {
    // Mock create exercise
    exerciseApi.create.mockResolvedValue({
      id: 5,
      name: "Test Exercise",
      category: "Upper Body",
      description: "Test description",
    });

    // Mock getAll exercises
    exerciseApi.getAll.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("allows creating a new exercise", async () => {
    render(<ExerciseTestPage />);

    // Click button to show form
    const createButton = screen.getByText("Crear Nuevo Ejercicio");
    fireEvent.click(createButton);

    // Fill out the form
    const nameInput = screen.getByLabelText("Nombre del Ejercicio");
    const descriptionInput = screen.getByLabelText("Descripción");
    const categoryInput = screen.getByLabelText("Categoría");

    fireEvent.change(nameInput, { target: { value: "Test Exercise" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    fireEvent.change(categoryInput, { target: { value: "Upper Body" } });

    // Submit the form
    const submitButton = screen.getByText("Crear Ejercicio");
    fireEvent.click(submitButton);

    // Verify API call with correct data
    await waitFor(() => {
      expect(exerciseApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Exercise",
          description: "Test description",
          category: "Upper Body",
        })
      );
    });

    // Verify success message is shown
    await waitFor(() => {
      expect(
        screen.getByText(/¡Ejercicio "Test Exercise" creado exitosamente!/)
      ).toBeInTheDocument();
    });
  });
});
