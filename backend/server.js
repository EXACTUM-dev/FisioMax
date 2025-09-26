/**
 * @fileoverview Archivo principal del servidor backend de la aplicación.
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * @description Configura y levanta el servidor Express con middlewares esenciales.
 */

// Importar el archivo de configuración central
import config from './config.js';

// Importar los módulos necesarios
import express from 'express';
import cors from 'cors';
import joi from 'joi';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import { requireAuth } from './src/middlewares/clerkAuth.js';

// Inicializar la aplicación Express
const app = express();

//---------------------------
// MIDDLEWARE DE SEGURIDAD
//---------------------------
/**
 * Middleware para asegurar la aplicación con cabeceras HTTP.
 * @see {@link https://helmetjs.github.io/}
 */
app.use(helmet());

/**
 * Middleware para habilitar CORS (Cross-Origin Resource Sharing).
 * Utiliza las configuraciones definidas en config.js.
 * @see {@link https://expressjs.com/en/resources/middleware/cors.html}
 */
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));

/**
 * Middleware para comprimir las respuestas HTTP.
 * Reduce el tamaño de los datos enviados al cliente.
 * @see {@link https://expressjs.com/en/resources/middleware/compression.html}
 */
app.use(compression());

/**
 * Middleware para registrar las solicitudes HTTP.
 * Útil para el registro y la depuración del servidor.
 * @see {@link https://expressjs.com/en/resources/middleware/morgan.html}
 */
app.use(morgan('combined'));


//--------------------------------
// MIDDLEWARE PARA PROCESAR DATOS
//--------------------------------
/**
 * Middleware integrado de Express para procesar el cuerpo de las solicitudes en formato JSON.
 */
app.use(express.json());

/**
 * Middleware integrado de Express para procesar datos de formularios URL-encoded.
 */
app.use(express.urlencoded({ extended: true }));



//------------------------- 
// DEFINICIÓN DE RUTAS
//-------------------------

/**
 * Ruta de prueba para verificar que el servidor está funcionando.
 * @name GET /
 * @function
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
app.get('/', (req, res) => {
  res.send('¡Servidor de backend funcionando correctamente!');
});

//-------------------------
// RUTAS PÚBLICAS
//-------------------------

/**
 * Ruta pública de login - No requiere autenticación.
 * @name POST /login
 * @function
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
app.post('/login', (req, res) => {
  // Aquí iría la lógica de autenticación con Clerk
  // Por ahora devolvemos una respuesta de ejemplo
  res.json({
    message: 'Endpoint de login - Acceso público',
    timestamp: new Date().toISOString()
  });
});

//-------------------------
// RUTAS PROTEGIDAS
//-------------------------

/**
 * Endpoint protegido para obtener usuarios - Requiere autenticación.
 * @name GET /api/usuarios
 * @function
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Array<Object>} Lista de usuarios en formato JSON.
 */
app.get('/api/usuarios', requireAuth, (req, res) => {
  // req.auth contiene la información del usuario autenticado
  const userId = req.auth?.userId;
  
  res.json({
    message: 'Lista de usuarios obtenida exitosamente',
    data: [
      { id: 1, nombre: 'Juan', email: 'juan@ejemplo.com' },
      { id: 2, nombre: 'Ana', email: 'ana@ejemplo.com' }
    ],
    authenticatedUserId: userId,
    timestamp: new Date().toISOString()
  });
});


// Exportar la aplicación para uso en pruebas
export { app };

//-------------------------
// INICIAR EL SERVIDOR
//-------------------------
/**
 * Inicia el servidor y lo pone a escuchar en el puerto especificado.
 * Solo se ejecuta si el archivo se ejecuta directamente (no en pruebas).
 */
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  app.listen(config.app.port, () => {
    console.log(`Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`);
  });
}