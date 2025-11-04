/**
 * @fileoverview Content routes for multimedia access
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Defines routes for content access and upload with Clerk authentication
 */

import express from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/clerkAuth.js";
import * as contentController from "../controllers/content.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB max for main content
  },
});

// Use fields to handle both file and thumbnail
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Protected routes - require Clerk authentication
router.get("/", requireAuth, contentController.index);
router.get("/:contentId", requireAuth, contentController.show);
router.post("/upload", requireAuth, uploadFields, contentController.upload);

export default router;
