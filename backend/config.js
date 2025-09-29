/**
 * @fileoverview Archivo de configuración central de la aplicación.
 * @version 2.0.0
 * @author EXACTUM-dev
 * @description Centraliza todas las variables de entorno y configuraciones de la aplicación.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Objeto de configuración principal de la aplicación.
 * @const {object}
 */
const config = {
  // Configuración de la aplicación y el servidor.
  app: {
    port: parseInt(process.env.PORT || '5000', 10), // Convertir a número
    env: process.env.NODE_ENV || 'development'
  },
  
  // Configuración de la base de datos MySQL.
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Cambiar DB_DATABASE a DB_NAME
    port: parseInt(process.env.DB_PORT || '3307', 10)
  },

  // Configuración para la autenticación (JWT).
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET
  },

  // Configuración de Clerk
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
  },
  // Configuración para servicios de almacenamiento de archivos (AWS).
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-2',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME, // Cambiar S3_BUCKET_NAME
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
    sesToEmail: process.env.AWS_SES_TO_EMAIL
  },

  // Configuración para CORS.
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:5173']
  },

  // Configuración de Rate Limiting
  rateLimit: {
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
    },
    api: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10)
    }
  }
};

// Método toJSON para NO exponer secretos cuando se serializa
config.toJSON = function() {
  return {
    app: this.app,
    db: {
      host: this.db.host,
      user: this.db.user,
      database: this.db.database,
      port: this.db.port
      // NO incluir password
    },
    aws: {
      region: this.aws.region,
      s3BucketName: this.aws.s3BucketName
      // NO incluir accessKeyId ni secretAccessKey
    },
    cors: this.cors,
    rateLimit: this.rateLimit
    // NO incluir auth
  };
};

export default config;