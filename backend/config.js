/**
 * @fileoverview Archivo de configuración central de la aplicación.
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
  },

  // Configuración de Clerk
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
  // Configuración para servicios de almacenamiento de archivos (AWS).
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-2",
    s3BucketName: process.env.AWS_S3_BUCKET_NAME, // Cambiar S3_BUCKET_NAME,
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
    sesToEmail: process.env.AWS_SES_TO_EMAIL,
  },

  // CORS configuration
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:5173"],
  },

  // Configuración de Rate Limiting
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
};

// Validar configuración de base de datos
console.log("🔍 Validando configuración de base de datos...");
console.log("📊 Database Config:", {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  database: config.db.database,
  passwordSet: !!config.db.password,
});

// Validar que las variables críticas existan
const requiredDbVars = ["host", "user", "database"];
const missingVars = requiredDbVars.filter((key) => !config.db[key]);

if (config.db.password === undefined || config.db.password === null) {
  missingVars.push("password");
}

if (missingVars.length > 0) {
  console.error(
    "❌ ERROR: Faltan las siguientes variables de entorno de base de datos:"
  );
  missingVars.forEach((varName) => {
    const envVarName =
      varName === "database" ? "DB_DATABASE" : `DB_${varName.toUpperCase()}`;
    console.error(`   - ${envVarName}`);
  });
  throw new Error(
    `Configuración de base de datos incompleta. Faltan: ${missingVars.join(
      ", "
    )}`
  );
}

if (config.db.password === "" && config.app.env === "development") {
  console.warn(
    "⚠️  ADVERTENCIA: La contraseña de la base de datos está vacía. Esto no es recomendado en producción."
  );
}

// Método toJSON para NO exponer secretos cuando se serializa
config.toJSON = function () {
  return {
    app: this.app,
    db: {
      host: this.db.host,
      user: this.db.user,
      database: this.db.database,
      port: this.db.port,
      // NO incluir password
    },
    aws: {
      region: this.aws.region,
      s3BucketName: this.aws.s3BucketName,
      // NO incluir accessKeyId ni secretAccessKey
    },
    cors: this.cors,
    rateLimit: this.rateLimit,
    // NO incluir auth
  };
};
// Crea y exporta el pool de conexiones
export const dbPool = mysql.createPool(config.db);
// Validar configuración de base de datos
console.log("🔍 Validando configuración de base de datos...");
console.log("📊 Database Config:", {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  database: config.db.database,
  passwordSet: !!config.db.password,
});

if (missingVars.length > 0) {
  console.error(
    "❌ ERROR: Faltan las siguientes variables de entorno de base de datos:"
  );
  missingVars.forEach((varName) => {
    const envVarName =
      varName === "database" ? "DB_DATABASE" : `DB_${varName.toUpperCase()}`;
    console.error(`   - ${envVarName}`);
  });
  throw new Error(
    `Configuración de base de datos incompleta. Faltan: ${missingVars.join(
      ", "
    )}`
  );
}

export default config;
