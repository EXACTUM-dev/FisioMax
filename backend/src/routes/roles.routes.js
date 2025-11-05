/**
 * @fileoverview API endpoints for role management.
 * @version 0.3.2
 * @author EXACTUM-dev
 */

import express from 'express';
import {
  getRoleById,
  updateRole,
  getAllRoles,
  getCreateRole,
  createRole,
  deleteRole,
} from '../controllers/roles.controller.js';
import {requireAuth, autoSyncClerkId} from '../middlewares/clerkAuth.js';
import {requireDbUser} from '../middlewares/requireDbUser.js';
import {authorize} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// No authorization required - needed for role dropdown in user management panel
router.get('/', requireAuth, autoSyncClerkId, requireDbUser, getAllRoles);

router.get(
    '/create',
    requireAuth,
    authorize(['Gestión de Roles']),
    autoSyncClerkId,
    requireDbUser,
    getCreateRole
);

router.post('/create', requireAuth, autoSyncClerkId, requireDbUser, createRole);

router.get(
    '/edit/:id',
    requireAuth,
    authorize(['Gestión de Roles']),
    autoSyncClerkId,
    requireDbUser,
    getRoleById
);

router.post(
    '/edit/:id',
    requireAuth,
    authorize(['Gestión de Roles']),
    autoSyncClerkId,
    requireDbUser,
    updateRole
);

router.delete(
    '/:id',
    requireAuth,
    autoSyncClerkId,
    requireDbUser,
    authorize(['Gestión de Roles']),
    deleteRole
);

export default router;
