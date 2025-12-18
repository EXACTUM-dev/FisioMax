/**
 * @fileoverview Router with endpoints for membership application managment.
 * @author EXACTUM-dev
 * @version 1.2.2
 * @description Defines endpoint to retrive membership applications and manage their approval status.
 */
import express from 'express';
import multer from 'multer';
import {
  createMembershipApplication,
  getMemberships,
  getMembershipById,
  approveMembership,
  denyMembership,
  getMaxNoAfiliadoController,
  deleteMembership
} from '../controllers/membershipApplication.controller.js';
import { authorize } from "../middlewares/rbacMiddleware.js";
import { requireAuth } from "../middlewares/clerkAuth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50, // Maximum 50 parts total (includes text fields + files)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware to handle multiple file uploads
const uploadFields = upload.fields([
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'professionalId', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
  { name: 'extraDoc1', maxCount: 1 },
  { name: 'extraDoc2', maxCount: 1 },
  { name: 'extraDoc3', maxCount: 1 },
  { name: 'extraDoc4', maxCount: 1 },
  { name: 'extraDoc5', maxCount: 1 },
  { name: 'extraDoc6', maxCount: 1 },
  { name: 'extraDoc7', maxCount: 1 },
  { name: 'extraDoc8', maxCount: 1 },
  { name: 'extraDoc9', maxCount: 1 },
  { name: 'extraDoc10', maxCount: 1 },
]);

// Error handler middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'Archivo demasiado grande. El límite es 10MB por archivo.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados campos en el formulario. Por favor contacta al administrador.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Campo de archivo no esperado: ${err.field}`,
        field: err.field,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivos: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Error al procesar los archivos',
    });
  }

  next();
};

/**
 * @route POST /api/membership-applications
 * @desc Create a new membership application
 * @access Public
 */
router.post('/', uploadFields, handleUploadError, createMembershipApplication);


/**
 * @route GET /api/membership-applications
 * @description Obtain all the membership application
 * @access Private
 */
router.get('/', requireAuth, authorize(["Gestión de Usuarios"]), getMemberships);

/**
 * @route GET /api/membership-applications/max-no-afiliado
 * @description Get the maximum noAfiliado
 * @access Private
 */
router.get('/max-no-afiliado', requireAuth, authorize(["Gestión de Usuarios"]), getMaxNoAfiliadoController);

/**
 * @route GET /api/membership-applications/{id}
 * @description Detail endpoint for a single membership application
 * @access Private
 */
router.get('/:id', requireAuth, authorize(["Gestión de Usuarios"]), getMembershipById);


/**
 * @route POST /api/membership-applications/{id}/aprobar
 * @description Approve the membership application
 * @access Private
 */
router.post('/:id/aprobar', requireAuth, authorize(["Gestión de Usuarios"]), approveMembership);

/**
 * @route POST /api/membership-applications/{id}/rechazar
 * @description Deny the membership application
 * @access Private
 */
router.post('/:id/rechazar', requireAuth, authorize(["Gestión de Usuarios"]), denyMembership);


/**
 * @route DELETE /api/membership-applications/{id}
 * @description Delete a membership application
 * @access Private
 */
router.delete('/:id', requireAuth, authorize(["Gestión de Usuarios"]), deleteMembership);


export default router;