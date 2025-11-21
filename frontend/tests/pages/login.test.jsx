import { render, screen } from "@testing-library/react";
import React from "react";
// Mock the API config used by the app to avoid parsing `import.meta` in tests
jest.mock("../../src/config/api", () => ({
  API_CONFIG: {
    BASE_URL: "http://localhost:5000",
    ENDPOINTS: { LOGS_LOGIN_ERRORS: "/api/logs/login-errors" },
  },
  buildApiUrl: (endpoint) => `http://localhost:5000${endpoint}`,
}));

import LoginPage from "../../src/pages/login";
import { BrowserRouter } from "react-router-dom";

jest.mock("@clerk/clerk-react", () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
  useUser: () => ({ isSignedIn: false, isLoaded: true }),
  useClerk: () => ({ addListener: () => () => {} }),
}));

describe("Login Page", () => {
  test("renderiza correctamente", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Verificar elementos principales según la UI actual
    expect(screen.getByText(/Bienvenido a la SOMEFIPP/i)).toBeInTheDocument();
    expect(screen.getByTestId("clerk-sign-in")).toBeInTheDocument();
    const membershipLink = screen.getByText(/Solicita tu membresía/i);
    expect(membershipLink).toBeInTheDocument();
    expect(membershipLink.closest("a")).toHaveAttribute(
      "href",
      "/solicitud-membresia"
    );
  });
});
