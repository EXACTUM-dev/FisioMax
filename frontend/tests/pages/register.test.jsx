import { render, screen } from "@testing-library/react";
import React from "react";
import RegisterPage from "../../src/pages/register";

describe("Register Page", () => {
  test("renderiza correctamente", () => {
    render(<RegisterPage />);

    // Verificar elementos principales
    expect(screen.getByText(/FisioMax/i)).toBeInTheDocument();
    expect(screen.getByText(/Crea tu cuenta nueva/i)).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
  });
});
