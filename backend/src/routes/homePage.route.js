/**
 * @fileoverview HomePage routes for content display
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Defines routes for home page content with Clerk authentication
 */

import express from "express";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import * as homePageController from "../controllers/homePage.controller.js";

const router = express.Router();

// Protected routes - require Clerk authentication
router.get("/home", requireAuth, autoSyncClerkId, homePageController.getHomeContent);
router.get("/home/search", requireAuth, autoSyncClerkId, homePageController.search);

export default router;
