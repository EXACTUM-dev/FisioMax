/**
 * @fileoverview Central application configuration file.
 * @version 2.0.0
 * @author EXACTUM-dev
 * @description Centralizes environment variables and app configuration.
 */

import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
/**
 * Helper to parse CSV env variables into arrays (trims spaces).
 * @param {string|undefined} csv
 * @param {string[]} fallback
 * @returns {string[]}
 */
function parseCsvEnv(csv, fallback) {
  if (!csv) return fallback;
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Main configuration object.
 * @const {object}
 */
const config = {
  // App and server configuration
  app: {
    port: parseInt(process.env.PORT || "5000", 10), // Convertir a número
    env: process.env.NODE_ENV || "development",
  },

  // MySQL database configuration
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  },

  // Auth configuration (JWT)
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  },

  // Clerk configuration
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  },
  // AWS storage services configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-2",
    s3BucketName: process.env.AWS_S3_BUCKET_NAME,
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
    sesToEmail: process.env.AWS_SES_TO_EMAIL,
  },

  // CORS configuration
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:5173"],
  },

  // Rate limiting configuration
  rateLimit: {
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
    },
    api: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || "900000", 10),
      max: parseInt(process.env.API_RATE_LIMIT_MAX || "100", 10),
    },
  },

  // Encryption configuration
  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },
};

// Validate critical environment variables
if (
  !process.env.DB_HOST ||
  !process.env.JWT_SECRET ||
  !process.env.CLERK_SECRET_KEY ||
  !process.env.ENCRYPTION_KEY
) {
  throw new Error(
    "Faltan variables de entorno críticas. Verifica el archivo .env"
  );
}

// toJSON method to avoid exposing secrets when serialized
config.toJSON = function () {
  return {
    app: this.app,
    db: {
      host: this.db.host,
      user: this.db.user,
      database: this.db.database,
      port: this.db.port,
      // DO NOT include password
    },
    aws: {
      region: this.aws.region,
      s3BucketName: this.aws.s3BucketName,
      // DO NOT include accessKeyId or secretAccessKey
    },
    cors: this.cors,
    rateLimit: this.rateLimit,
    // DO NOT include auth
  };
};
// Create and export the connection pool
export const dbPool = mysql.createPool(config.db);

export default config;
