/**
 * @fileoverview Content routes for multimedia access
 * @version 0.3.2
 * @author EXACTUM-dev
 * @description Defines routes for content access and upload with Clerk authentication
 */

import express from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/clerkAuth.js";
import * as contentController from "../controllers/content.controller.js";

const router = express.Router();

// Configure multer storage and limits
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "file") {
    // Main content files
    const allowedMainTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/mpeg",
      "application/pdf",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp3",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMainTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Tipo de archivo principal no permitido: ${file.mimetype}`),
        false
      );
    }
  } else if (file.fieldname === "thumbnail") {
    // Thumbnail images
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de miniatura no permitido: ${file.mimetype}`), false);
    }
  } else {
    cb(new Error(`Campo no esperado: ${file.fieldname}`), false);
  }
};

// Configure multer upload with different limits per field
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB global limit (will be checked per field below)
    files: 2, // Max 2 files total
  },
});

// Middleware to handle multiple fields with individual size validation
const uploadFields = (req, res, next) => {
  const uploader = upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message:
            "Archivo demasiado grande. Límite: 5GB para contenido, 20MB para miniatura",
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message:
            "Demasiados archivos. Máximo: 1 archivo principal + 1 miniatura",
        });
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: `Campo inesperado. Solo se permiten 'file' y 'thumbnail'`,
        });
      }

      return res.status(400).json({
        success: false,
        message: `Error de carga: ${err.message}`,
      });
    }

    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error al procesar los archivos",
      });
    }

    // Validate individual file sizes after upload
    if (req.files?.file?.[0]) {
      const mainFileSize = req.files.file[0].size;
      const maxMainSize = 5 * 1024 * 1024 * 1024; // 5GB

      if (mainFileSize > maxMainSize) {
        return res.status(413).json({
          success: false,
          message: "El archivo principal excede el tamaño máximo de 5GB",
        });
      }
    }

    if (req.files?.thumbnail?.[0]) {
      const thumbnailSize = req.files.thumbnail[0].size;
      const maxThumbnailSize = 20 * 1024 * 1024; // 20MB

      if (thumbnailSize > maxThumbnailSize) {
        return res.status(413).json({
          success: false,
          message: "La miniatura excede el tamaño máximo de 20MB",
        });
      }
    }

    console.log("Paso el multer");
    next();
  });
};

// Protected routes - require Clerk authentication
router.get("/", requireAuth, contentController.index);
router.get("/available", requireAuth, contentController.index);
router.get("/:contentId", requireAuth, contentController.show);
router.post("/upload", requireAuth, uploadFields, contentController.upload);
router.post("/presign", requireAuth, contentController.presignUploadUrl);

export default router;
