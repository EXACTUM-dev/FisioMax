/**
 * @fileoverview Security tests setup utilities
 * @version 0.1.1
 * @author EXACTUM-dev
 * @description Loads environment and mocks for security test suites
 */
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { jest } from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test env early
dotenv.config({
  path: resolve(__dirname, ".env.test"),
  override: true,
});

// Mock mysql pool so importing config doesn't open real connections
try {
  jest.unstable_mockModule("mysql2/promise", () => ({
    createPool: (cfg) => ({
      query: async () => [[], []],
      getConnection: async () => ({
        beginTransaction: async () => {},
        query: async () => [{ insertId: 1, affectedRows: 1 }],
        commit: async () => {},
        rollback: async () => {},
        release: async () => {},
      }),
    }),
    // Ensure default import shape is available as well
    default: {
      createPool: (cfg) => ({
        query: async () => [[], []],
        getConnection: async () => ({
          beginTransaction: async () => {},
          query: async () => [{ insertId: 1, affectedRows: 1 }],
          commit: async () => {},
          rollback: async () => {},
          release: async () => {},
        }),
      }),
    },
  }));
} catch (err) {
  // ignore
}

// Mock external middlewares used by server so tests remain isolated
try {
  jest.unstable_mockModule("../../src/middlewares/clerkAuth.js", () => ({
    requireAuth: (req, res, next) => next(),
    autoSyncClerkId: (req, res, next) => next(),
  }));
} catch (err) {}

try {
  jest.unstable_mockModule("../../src/middlewares/requireDbUser.js", () => ({
    requireDbUser: (req, res, next) => next(),
  }));
} catch (err) {}

try {
  jest.unstable_mockModule("../../src/middlewares/sessionTimeout.js", () => ({
    sessionTimeoutMiddleware: (req, res, next) => next(),
  }));
} catch (err) {}

try {
  jest.unstable_mockModule("../../src/middlewares/rbacMiddleware.js", () => ({
    authorize:
      (roles = []) =>
      (req, res, next) =>
        next(),
  }));
} catch (err) {}

// Keep this setup minimal — tests import a dedicated test app instead of server.js

// Dummy test so Jest doesn't fail if this file is picked up as a test suite
test("security setup noop", () => {
  expect(true).toBe(true);
});
