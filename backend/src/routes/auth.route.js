/**
 * @fileoverview Rutas de autenticación.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import express from 'express';
import { requireAuth, autoSyncClerkId } from '../middlewares/clerkAuth.js';
import { requireDbUser } from '../middlewares/requireDbUser.js';
import { getProfile } from '../controllers/auth.controller.js';

const router = express.Router();

// GET /api/auth/profile - devuelve el perfil del usuario autenticado
// 1. Valida con Clerk (requireAuth)
// 2. Auto-sincroniza clerkID si es necesario (autoSyncClerkId)
// 3. Verifica que exista en BD (requireDbUser)
router.get('/profile', requireAuth, autoSyncClerkId, requireDbUser, getProfile);

export default router;
