/**
 * @fileoverview API endpoints for role management
 * @version 0.3.1
 * @author EXACTUM-dev
 */

import express from "express";
import {
  getRoleById,
  updateRole,
  getAllRoles,
  getCreateRole,
  createRole,
} from "../controllers/roles.controller.js";
import { requireAuth } from "../middlewares/clerkAuth.js";

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles (for listing)
 * @access  Protected
 */
router.get("/", requireAuth, getAllRoles);

/**
 * @route   GET /api/roles/create
 * @desc    Get data needed for role creation
 * @access  Protected
 */
router.get("/create", requireAuth, getCreateRole);

/**
 * @route   POST /api/roles/create
 * @desc    Create a new role with privileges
 * @access  Protected
 */
router.post("/create", requireAuth, createRole);

/**
 * @route   GET /api/roles/edit/:id
 * @desc    Get role by ID with privileges for editing
 * @access  Protected
 */
router.get("/edit/:id", requireAuth, getRoleById);

/**
 * @route   POST /api/roles/edit/:id
 * @desc    Update role and its privileges
 * @access  Protected
 */
router.post("/edit/:id", requireAuth, updateRole);

export default router;
