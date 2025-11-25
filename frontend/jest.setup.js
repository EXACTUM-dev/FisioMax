import React from "react";
import "@testing-library/jest-dom";

// Fix para React 19
global.React = React;

// Mock para import.meta.env (Vite environment variables)
global.import = {
  meta: {
    env: {
      VITE_API_URL: process.env.VITE_API_URL || "http://localhost:3000/api",
      VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY || "test_key",
    },
  },
};

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
  useAuth: () => ({
    getToken: async () => "test-token",
  }),
}));

// Mock para variables de entorno
global.process.env.VITE_CLERK_PUBLISHABLE_KEY = "test_key";

// Provide a default global.fetch mock for tests that call APIs
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ success: true, data: { IDUsuario: 1, nombres: 'Test User' } }),
    })
  );
}

// Polyfill TextEncoder/TextDecoder for Jest/jsdom environment when missing
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
