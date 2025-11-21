/**
 * @fileoverview Clerk authentication middleware for Express.js.
 * @version 1.1.0
 * @author EXACTUM-dev
 *
 * Verifies Clerk JWT and attaches user information to the request.
 */
import { ClerkExpressRequireAuth, clerkClient } from "@clerk/clerk-sdk-node";
import config from "../../config.js";
import {
  getUserByClerkId,
  getUserByEmail,
  updateUserClerkId,
} from "../models/users.model.js";
import { insertLoginErrorLog } from "../models/loginLogs.model.js";
import { getRequestIp } from "../utils/request.js";

/**
 * Clerk authentication middleware that requires valid authentication.
 * Validates JWT token and adds auth information to req.auth.
 */
export const requireAuth = ClerkExpressRequireAuth({
  secretKey: config.clerk.secretKey,
});

/**
 * Middleware that automatically syncs clerkID with the database.
 * If a user doesn't have a clerkID in DB but exists with the same email,
 * it automatically links them.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.auth - Clerk authentication object.
 * @param {string} req.auth.userId - The Clerk user ID.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @return {Promise<void>}
 */
export const autoSyncClerkId = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return next();
    }

    // Check if user already exists with this clerkID
    const userByClerkId = await getUserByClerkId(clerkUserId);

    if (userByClerkId) {
      // Already linked, continue
      return next();
    }

    // Not linked, attempt to link by email
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return next();
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Search for user in DB by email (getUserByEmail already encrypts it)
    const dbUser = await getUserByEmail(normalizedEmail);

    if (!dbUser) {
      // User doesn't exist in DB, do nothing (requireDbUser will block it)
      return next();
    }

    // User exists in DB but has no clerkID, link automatically
    if (!dbUser.clerkID) {
      await updateUserClerkId(dbUser.IDUsuario, clerkUserId);
    }

    next();
  } catch (error) {
    console.error("Error in autoSyncClerkId:", error);
    
    /**
     * Log synchronization error when failing to sync clerkID with database.
     */
    try {
      await insertLoginErrorLog({
        usuario: req.auth?.userId || null,
        ipOrigen: getRequestIp(req),
        agenteUsuario: req.headers['user-agent'] || null,
        codigoError: 'CLERK_SYNC_ERROR',
        mensajeError: 'Error al sincronizar clerkID con la base de datos',
        detalles: {
          path: req.originalUrl || req.url,
          method: req.method,
          message: error?.message,
        },
      });
    } catch (logError) {
      /**
       * Don't interrupt the flow if logging fails.
       */
      console.error('Error al registrar log de sincronización:', logError);
    }
    
    // Don't block the request due to a sync error
    next();
  }
};
