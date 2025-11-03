/**
 * @fileoverview API endpoints for role management.
 * @version 0.3.2
 * @author EXACTUM-dev
 */

import express from "express";
import {
  getRoleById,
  updateRole,
  getAllRoles,
  getCreateRole,
  createRole,
  deleteRole,
} from "../controllers/roles.controller.js";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import { requireDbUser } from "../middlewares/requireDbUser.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

// Get all roles
router.get(
  "/",
  requireAuth,
  authorize(["Gestión de Roles"]),
  autoSyncClerkId,
  requireDbUser,
  getAllRoles
);

// Get create role form/page
router.get(
  "/create",
  requireAuth,
  authorize(["Gestión de Roles"]),
  autoSyncClerkId,
  requireDbUser,
  getCreateRole
);

// Create new role
router.post("/create", requireAuth, autoSyncClerkId, requireDbUser, createRole);

// Get role by ID for editing
router.get(
  "/edit/:id",
  requireAuth,
  authorize(["Gestión de Roles"]),
  autoSyncClerkId,
  requireDbUser,
  getRoleById
);

// Update role by ID
router.post(
  "/edit/:id",
  requireAuth,
  authorize(["Gestión de Roles"]),
  autoSyncClerkId,
  requireDbUser,
  updateRole
);

router.delete("/:id", requireAuth, autoSyncClerkId, requireDbUser, deleteRole);

export default router;
