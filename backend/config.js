/**
 * @fileoverview Archivo de configuración central de la aplicación.
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Centraliza todas las variables de entorno y configuraciones de la aplicación.
 */

// Cargar las variables de entorno si aún no están cargadas.
import dotenv from 'dotenv';
dotenv.config();

/**
 * Objeto de configuración principal de la aplicación.
 * @const {object}
 */
const config = {
  // Configuración de la aplicación y el servidor.
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Configuración de la base de datos MySQL.
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  // Configuración para la autenticación (JWT).
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET
  },

  // Configuración para servicios de almacenamiento de archivos (S3).
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME
  },

  // Configuración para CORS.
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173']
  }
};

export default config;