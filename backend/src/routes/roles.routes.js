/**
 * Version: 0.3.0
 * Roles routes - API endpoints for role management
 */

import express from "express";
import {
  getAllRoles,
} from "../controllers/roles.controller.js";
import { requireAuth } from "../middlewares/clerkAuth.js";
import { requireRole } from "../middlewares/requireRoles.js";

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles (for listing)
 * @access  Protected (Admin)
 */
// router.get("/", requireAuth, getAllRoles);

router.get("/", getAllRoles);

export default router;
