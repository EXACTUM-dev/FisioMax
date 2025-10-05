
/**
 * @fileoverview Controlador de autenticación (Clerk) - expone endpoints relacionados con el usuario autenticado.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { getUserById } from '../services/auth.service.js';


/**
 * Devuelve la información del usuario autenticado. Este endpoint asume que
 * el middleware de Clerk (ClerkExpressRequireAuth) ya ha validado la sesión
 * y ha añadido `req.auth` con la información de la sesión.
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }


        const user = await getUserById(userId);
        return res.json({ user, auth: req.auth });
    } catch (error) {
        console.error('auth.controller.getProfile error:', error);
        return res.status(500).json({ error: 'Error al obtener perfil', detail: error?.message });
    }
};


