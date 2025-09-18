/**
 * @fileoverview Archivo principal del servidor backend de la aplicación.
 * @description Configura y levanta el servidor Express con middlewares esenciales.
 */

// Importar el archivo de configuración central
const config = require('./config');

// Importar los módulos necesarios
const express = require('express');
const cors = require('cors');
const joi = require('joi');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');

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
app.use(cors({ origin: config.cors.allowedOrigins }));

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
// INICIAR EL SERVIDOR
//-------------------------
/**
 * Inicia el servidor y lo pone a escuchar en el puerto especificado.
 */
app.listen(config.app.port, () => {
  console.log(`Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`);
});