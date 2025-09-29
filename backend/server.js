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
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
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

/**
 * Configuracion del servicio SES
 */
// Configurar SES
const sesClient = new SESClient({
    region: 'us-east-2', // Cambia por tu región
});

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
  console.log("Usuarios");
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

/**
 * Endpoint de ejemplo para enviar correos.
 * @name GET /api/usuarios
 * @function
 * @returns {Array<Object>} Mensaje de operacion exitosa/error.
 */
app.post('/api/contacto', async (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ 
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        const params = {
            Source: 'trujillo_jaime@outlook.com', // Email verificado en SES
            Destination: {
                ToAddresses: [email], // Tu email real
            },
            Message: {
                Subject: {
                    Data: `Nuevo mensaje de contacto de ${nombre}`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: `
Nombre: ${nombre}
Email: ${email}
Mensaje: ${mensaje}

Enviado desde: ${req.headers.host}
                        `,
                        Charset: 'UTF-8'
                    },
                    Html: {
                        Data: `
<h3>Nuevo mensaje de contacto</h3>
<p><strong>Nombre:</strong> ${nombre}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Mensaje:</strong> ${mensaje}</p>
<p><strong>Enviado desde:</strong> ${req.headers.host}</p>
                        `,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        const command = new SendEmailCommand(params);
        await sesClient.send(command);

        res.json({ success: true, message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error('Error enviando email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al enviar el mensaje. Intenta nuevamente.'
        });
    }
});

//-------------------------
// INICIAR EL SERVIDOR
//-------------------------
/**
 * Inicia el servidor y lo pone a escuchar en el puerto especificado.
 * Solo se ejecuta si el archivo se ejecuta directamente (no en pruebas).
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.app.port, () => {
    console.log(`Servidor corriendo en ${config.app.env} en http://localhost:${config.app.port}`);
  });
}