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

// Ensure all critical test env vars have safe literal defaults so CI doesn't
// depend on an external .env.test file. These values are test-only and
// contain no real secrets.
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "test_encryption_key_please_replace";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || "test_session_secret_please_replace";

// Database defaults (local-test/dummy values)
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_USER = process.env.DB_USER || "test_user";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "test_secure_password";
process.env.DB_DATABASE = process.env.DB_DATABASE || "fisiomax_test";
process.env.DB_PORT = process.env.DB_PORT || "3306";

// AWS dummy values for tests (non-production)
process.env.AWS_ACCESS_KEY_ID =
  process.env.AWS_ACCESS_KEY_ID || "test_access_key";
process.env.AWS_SECRET_ACCESS_KEY =
  process.env.AWS_SECRET_ACCESS_KEY || "test_secret_key";
process.env.AWS_S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || "test-bucket";
process.env.AWS_SES_FROM_EMAIL =
  process.env.AWS_SES_FROM_EMAIL || "test-from@example.com";
process.env.AWS_SES_TO_EMAIL =
  process.env.AWS_SES_TO_EMAIL || "test-to@example.com";
process.env.AWS_REGION = process.env.AWS_REGION || "us-east-2";

// CORS
// Include common dev origins used by tests (Vite, CRA, other local dev servers)
process.env.CORS_ORIGINS =
  process.env.CORS_ORIGINS ||
  "http://localhost:5174,http://localhost:3000,http://localhost:8129,http://localhost:2716";

// Rate limiting/logging defaults
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "error";
process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || "900000";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || "100";

export default {};
