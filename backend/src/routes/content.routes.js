/**
 * @fileoverview Content routes for video access
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Defines routes for content access with Clerk authentication
 */

import express from "express";
import { requireAuth } from "../middlewares/clerkAuth.js";
import * as contentController from "../controllers/content.controller.js";
import {authorize} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Protected routes - require Clerk authentication
router.get("/videos", requireAuth, contentController.index);
router.get("/videos/:videoId", requireAuth, contentController.show);

export default router;
