/**
 * Version: 0.3.0
 * Roles routes - API endpoints for role management
 */

import express from "express";
import {
  getRoleById,
  updateRole,
  getAllRoles,
  getAllPrivilegesController,
} from "../controllers/roles.controller.js";
import { requireAuth } from "../middlewares/clerkAuth.js";
import { requireRole } from "../middlewares/requireRoles.js";

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles (for listing)
 * @access  Protected (Admin)
 */
router.get("/", requireAuth, getAllRoles);

/**
 * @route   GET /api/roles/edit/:id
 * @desc    Get role by ID with privileges for editing
 * @access  Protected (Admin)
 */
router.get("/edit/:id", requireAuth, getRoleById);

/**
 * @route   POST /api/roles/edit/:id
 * @desc    Update role and its privileges
 * @access  Protected (Admin)
 */
router.post("/edit/:id", requireAuth, updateRole);

export default router;