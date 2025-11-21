
/**
 * @fileoverview Authentication controller (Clerk + DB) - exposes endpoints related to authenticated users.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { getUserById } from '../services/auth.service.js';
import { getUserRolesAndPermissions } from '../models/rbac.model.js';
import { insertLoginErrorLog } from '../models/loginLogs.model.js';
import { getRequestIp } from '../utils/request.js';

/**
 * Retrieves the authenticated user's information combining Clerk and DB data.
 * This endpoint assumes that the Clerk middleware (ClerkExpressRequireAuth) has
 * already validated the session and added `req.auth` with session information.
 * Additionally, the requireDbUser middleware must have verified that the user exists in DB.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.auth - Clerk authentication object containing userId.
 * @param {string} req.auth.userId - The Clerk user ID.
 * @param {Object} res - Express response object.
 * @return {Promise<Object>} JSON response with user data or error.
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        // getUserById now returns combined data from Clerk + DB
        const userData = await getUserById(userId);
        const userPrivileges = await getUserRolesAndPermissions(userId);
        
        if (!userData.exists) {
            return res.status(403).json({ 
                error: 'Usuario no registrado en la base de datos',
                message: 'Su cuenta de Clerk existe pero no está vinculada a la base de datos. Contacte al administrador.',
                clerkData: userData.clerkData // Include Clerk data for debugging
            });
        }

        return res.json({ 
            success: true,
            user: {
                // Consolidated data
                id: userData.id,
                clerkID: userData.clerkID,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                imageUrl: userData.imageUrl,
                role: userData.role,
                roleId: userData.roleId,
                accept: userData.membershipState,
                userPrivileges,
                // Membership data
                membershipType: userData.membershipType,
                membershipExpiresAt: userData.membershipExpiresAt,
                membershipRegisteredAt: userData.membershipRegisteredAt,
                membershipPaymentStatus: userData.membershipPaymentStatus,
            }
        });
    } catch (error) {
        console.error('auth.controller.getProfile error:', error);
        
        /**
         * Log error when failing to fetch user profile.
         * @type {Error} error - The error that occurred during profile fetch
         */
        try {
            await insertLoginErrorLog({
                usuario: req.auth?.userId || null,
                ipOrigen: getRequestIp(req),
                agenteUsuario: req.headers['user-agent'] || null,
                codigoError: 'PROFILE_FETCH_ERROR',
                mensajeError: 'Error al obtener perfil del usuario',
                detalles: {
                    path: req.originalUrl || req.url,
                    method: req.method,
                    message: error?.message,
                },
            });
        } catch (logError) {
            /**
             * Don't interrupt the flow if logging fails.
             * @type {Error} logError - The error that occurred during logging
             */
            console.error('Error al registrar log de perfil:', logError);
        }
        
        return res.status(500).json({ 
            error: 'Error al obtener perfil', 
            detail: error?.message 
        });
    }
};


