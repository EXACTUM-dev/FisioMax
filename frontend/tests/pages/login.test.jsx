import { render, screen } from "@testing-library/react";
import React from "react";
import LoginPage from "../../src/pages/login";

describe("Login Page", () => {
  test("renderiza correctamente", () => {
    render(<LoginPage />);

    // Verificar elementos principales
    expect(screen.getByText(/FisioMax/i)).toBeInTheDocument();
    expect(screen.getByText(/Inicia sesión en tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-in")).toBeInTheDocument();
  });
});
