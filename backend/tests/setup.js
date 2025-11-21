// Common Jest setup for all tests (ESM)
// Loads test environment variables and sets shared test-only env overrides.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the tests/.env.test file
dotenv.config({
  path: path.resolve(__dirname, ".env.test"),
  override: true,
});

// Set common test env vars
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "test-clerk-key";

export default {};
