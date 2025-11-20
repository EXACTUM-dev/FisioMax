// Common Jest setup for all tests (CommonJS)
// Loads test environment variables and sets shared test-only env overrides.
const dotenv = require("dotenv");
const path = require("path");

// Load the tests/.env.test file
dotenv.config({
  path: path.resolve(__dirname, ".env.test"),
  override: true,
});

// Set common test env vars
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "test-clerk-key";

module.exports = {};
