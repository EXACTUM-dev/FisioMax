/**
 * @fileoverview Central application configuration file.
 * @version 1.1.0
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
    port: process.env.PORT || 5000,
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
  },

  // AWS S3 configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME,
  },

  // CORS configuration
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:5173"],
  },
};
// Crea y exporta el pool de conexiones
export const dbPool = mysql.createPool(config.db);

export default config;
