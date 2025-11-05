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

// Configure multer for main content file uploads (5GB limit)
const uploadContent = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit for main content
  },
});

// Configure multer for thumbnail uploads (20MB limit)
const uploadThumbnail = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for thumbnails
  },
});

// Combined upload middleware that handles both fields with different limits
const uploadFields = (req, res, next) => {
  // First, handle the main file with 5GB limit
  const mainFileUpload = uploadContent.single('file');
  
  mainFileUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo de contenido excede el tamaño máximo permitido de 5GB',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Error al subir archivo: ${err.message}`,
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el archivo',
      });
    }
    
    // Store the main file temporarily
    const mainFile = req.file;
    
    // Then, handle the thumbnail with 20MB limit (optional)
    const thumbnailUpload = uploadThumbnail.single('thumbnail');
    
    thumbnailUpload(req, res, (thumbnailErr) => {
      if (thumbnailErr instanceof multer.MulterError) {
        if (thumbnailErr.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'La miniatura excede el tamaño máximo permitido de 20MB',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Error al subir miniatura: ${thumbnailErr.message}`,
        });
      } else if (thumbnailErr) {
        // Ignore errors if thumbnail is optional
        console.warn('Thumbnail upload warning:', thumbnailErr.message);
      }
      
      // Restructure files to match the expected format in controller
      req.files = {};
      
      if (mainFile) {
        req.files.file = [mainFile];
      }
      
      if (req.file && req.file.fieldname === 'thumbnail') {
        req.files.thumbnail = [req.file];
      }
      
      delete req.file;
      
      next();
    });
  });
};

// Protected routes - require Clerk authentication
router.get("/", requireAuth, contentController.index);
router.get("/:contentId", requireAuth, contentController.show);
router.post("/upload", requireAuth, uploadFields, contentController.upload);

export default router;
