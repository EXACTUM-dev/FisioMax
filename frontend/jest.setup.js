import React from "react";
import "@testing-library/jest-dom";

// Fix para React 19
global.React = React;

// Mock para Clerk Authentication
jest.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }) => <div data-testid="signed-out">{children}</div>,
  SignIn: () => <div data-testid="clerk-sign-in">SignIn Component</div>,
  SignUp: () => <div data-testid="clerk-sign-up">SignUp Component</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      firstName: "Test",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
  }),
}));

// Mock para variables de entorno
global.process.env.VITE_CLERK_PUBLISHABLE_KEY = "test_key";
