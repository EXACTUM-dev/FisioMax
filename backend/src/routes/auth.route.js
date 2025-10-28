/**
 * @fileoverview Authentication routes.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import express from 'express';
import {requireAuth, autoSyncClerkId} from '../middlewares/clerkAuth.js';
import {requireDbUser} from '../middlewares/requireDbUser.js';
import {getProfile} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * GET /api/auth/profile - Returns the authenticated user's profile.
 * Middleware chain:
 * 1. Validates with Clerk (requireAuth)
 * 2. Auto-syncs clerkID if necessary (autoSyncClerkId)
 * 3. Verifies user exists in DB (requireDbUser)
 */
router.get('/profile', requireAuth, autoSyncClerkId, requireDbUser, getProfile);

export default router;
