/**
 * @fileoverview Content routes for multimedia access
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Defines routes for content access with Clerk authentication
 */

import express from "express";
import { requireAuth } from "../middlewares/clerkAuth.js";
import * as contentController from "../controllers/content.controller.js";

const router = express.Router();

// Protected routes - require Clerk authentication
router.get("/content", requireAuth, contentController.index);
router.get("/content/:contentId", requireAuth, contentController.show);

export default router;
