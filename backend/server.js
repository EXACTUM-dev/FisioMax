/**
 * @fileoverview Archivo principal del servidor backend de la aplicación.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * @description Configura y levanta el servidor Express con middlewares esenciales.
 */

// Importar el archivo de configuración central
import config from "./config.js";

// Importar los módulos necesarios
import express from "express";
import cors from "cors";
import joi from "joi";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import exerciseRoutes from "./src/routes/exerciseRoutes.js";

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
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

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
app.use(morgan("combined"));

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
app.get("/", (req, res) => {
  res.send("¡Servidor de backend funcionando correctamente!");
});

/**
 * Endpoint de ejemplo para obtener usuarios.
 * @name GET /api/usuarios
 * @function
 * @returns {Array<Object>} Lista de usuarios en formato JSON.
 */
app.get("/api/usuarios", (req, res) => {
  res.json([
    { id: 1, nombre: "Juan", email: "juan@ejemplo.com" },
    { id: 2, nombre: "Ana", email: "ana@ejemplo.com" },
  ]);
});

// Define API routes
app.use("/api/exercises", exerciseRoutes);

//-------------------------
// INICIAR EL SERVIDOR
//-------------------------
/**
 * Inicia el servidor y lo pone a escuchar en el puerto especificado.
 */
app.listen(config.app.port, () => {
  console.log(
    `Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`
  );
});
