/**
 * Configuración base para pruebas de integración
 * @fileoverview Setup común para todas las pruebas de integración
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno para testing
dotenv.config({ 
  path: resolve(__dirname, '../.env.test'),
  override: true 
});

// Configurar variables de entorno específicas para integración
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.CLERK_SECRET_KEY = 'test-clerk-key';
