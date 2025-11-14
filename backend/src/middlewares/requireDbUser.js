/**
 * @fileoverview Middleware that validates authenticated Clerk user exists in DB.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * This middleware should be used AFTER requireAuth (clerkAuth).
 * Validates that the Clerk authenticated user also exists in the database.
 */

import {userExistsInDB} from '../services/auth.service.js';
import {insertLoginErrorLog} from '../models/loginLogs.model.js';
import {getRequestIp} from '../utils/request.js';

/**
 * Registra un error de login sin interrumpir el flujo principal.
 * @param {Object} req - Express request.
 * @param {Object} logData - Datos adicionales del log.
 */
async function logLoginError(req, logData) {
  try {
    await insertLoginErrorLog({
      ipOrigen: getRequestIp(req),
      agenteUsuario: req.headers['user-agent'] || null,
      ...logData,
      detalles:
          logData.detalles ??
          {
            path: req.originalUrl || req.url,
            method: req.method,
          },
    });
  } catch (logError) {

  }
}

/**
 * Middleware that verifies the Clerk authenticated user exists in DB.
 * Must be used after the requireAuth middleware from Clerk.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.auth - Clerk authentication object.
 * @param {string} req.auth.userId - The Clerk user ID.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @return {Promise<void>}
 */
export async function requireDbUser(req, res, next) {
  try {
    // Verify that Clerk middleware already validated the session
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      await logLoginError(req, {
        usuario: null,
        codigoError: 'AUTH_NO_CLERK_USER',
        mensajeError: 'Usuario no autenticado',
      });
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'No se encontró información de autenticación de Clerk',
      });
    }

    // Verify that user exists in the database
    const existsInDB = await userExistsInDB(clerkUserId);

    if (!existsInDB) {
      await logLoginError(req, {
        usuario: clerkUserId,
        codigoError: 'USER_NOT_IN_DB',
        mensajeError: 'Usuario no autorizado',
      });
      return res.status(403).json({
        error: 'Usuario no autorizado',
        message:
            'El usuario autenticado no está registrado en la base de datos. Por favor contacte al administrador.',
        clerkUserId: clerkUserId, // Useful for debugging
      });
    }

    // User exists in DB, continue
    next();
  } catch (error) {

    await logLoginError(req, {
      usuario: req.auth?.userId ?? null,
      codigoError: 'DB_VALIDATION_ERROR',
      mensajeError: 'Error al validar usuario',
      detalles: {
        message: error?.message,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
    });
    return res.status(500).json({
      error: 'Error al validar usuario',
      detail: error?.message,
    });
  }
}

/**
 * Optional middleware that adds a warning if user doesn't exist in DB
 * but allows request to continue (useful for sync endpoints).
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.auth - Clerk authentication object.
 * @param {string} req.auth.userId - The Clerk user ID.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @return {Promise<void>}
 */
export async function checkDbUser(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId;

    if (clerkUserId) {
      const existsInDB = await userExistsInDB(clerkUserId);
      req.userExistsInDB = existsInDB;

      if (!existsInDB) {
        console.warn(
            `Usuario ${clerkUserId} autenticado en Clerk pero no existe en BD`
        );
      }
    }

    next();
  } catch (error) {
    // Don't block the request, just log
    next();
  }
}
