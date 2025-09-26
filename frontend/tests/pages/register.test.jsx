/**
 * Version: 0.1.0
 * Register page test component
 * Validates that the register page renders correctly with all required elements
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import RegisterPage from "../../src/pages/register";

describe("Register Page", () => {
  test("renders correctly with all elements", () => {
    render(<RegisterPage />);

    // Verify main elements presence
    expect(screen.getByText(/FisioMax/i)).toBeInTheDocument();
    expect(screen.getByText(/Crea tu cuenta nueva/i)).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
  });
});
