/**
 * Version: 0.1.0
 * Login page test component
 * Validates that the login page renders correctly with all required elements
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import LoginPage from "../../src/pages/login";

describe("Login Page", () => {
  test("renders correctly with all elements", () => {
    render(<LoginPage />);

    // Verify main elements presence
    expect(screen.getByText(/FisioMax/i)).toBeInTheDocument();
    expect(screen.getByText(/Inicia sesión en tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-in")).toBeInTheDocument();
  });
});
