
/**
 * @fileoverview Rutas de autenticación.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import express from 'express';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { getProfile } from '../controllers/auth.controller.js';

const router = express.Router();

// GET /api/profile - devuelve el perfil del usuario autenticado
router.get('/profile', requireAuth, getProfile);

export default router;
