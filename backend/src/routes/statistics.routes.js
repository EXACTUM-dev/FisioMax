/**
 * @fileoverview Statistics routes for membership reports
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Defines endpoints for retrieving membership statistics
 */

import express from "express";
import {
  getMembershipStatistics,
  exportMembershipStatistics,
} from "../controllers/statistics.controller.js";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import { authorize } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/statistics/memberships
 * @description Get membership statistics (residence, category, education)
 * @access Private - Requires "Gestión de Usuarios" role
 */
router.get(
  "/memberships",
  requireAuth,
  autoSyncClerkId,
  authorize(["Gestión de Usuarios"]),
  getMembershipStatistics
);

/**
 * @route GET /api/statistics/memberships/export
 * @description Export membership statistics as PDF
 * @access Private - Requires "Gestión de Usuarios" role
 */
router.get(
  "/memberships/export",
  requireAuth,
  autoSyncClerkId,
  authorize(["Gestión de Usuarios"]),
  exportMembershipStatistics
);

export default router;

