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

router.get("/", requireAuth, getAllRoles);

router.get("/create", requireAuth, getCreateRole);

router.post("/create", requireAuth, createRole);

router.get("/edit/:id", requireAuth, getRoleById);

router.post("/edit/:id", requireAuth, updateRole);

export default router;
