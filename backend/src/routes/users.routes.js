/**
 * @fileoverview Route to fetch user names from the database model.
 * Defines the endpoint to retrieve user names.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from "express";
import multer from "multer";
import { getCurrentUserProfile, getUserProfileById, getAllUsers, updateUser, updateUserDocuments, deleteUser, getUserCertificate, regenerateCertificate } from "../controllers/users.controller.js";
import { assignUserRole } from "../controllers/roles.controller.js";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import { requireDbUser } from "../middlewares/requireDbUser.js";
import { authorize } from '../middlewares/rbacMiddleware.js';

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

// Middleware to handle document file uploads with error logging
const uploadDocuments = (req, res, next) => {
  const uploader = upload.fields([
    { name: 'titulo', maxCount: 1 },
    { name: 'cedula', maxCount: 1 },
    { name: 'constancias', maxCount: 1 },
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

  uploader(req, res, (err) => {
    next(err);
  });
};

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
 * Route to get all users.
 * @name GET /
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path.
 * @param {function} middleware - Express middleware.
 */
router.get("/", requireAuth, autoSyncClerkId, requireDbUser, getAllUsers);

/**
 * Route to get the current user's profile.
 * @name GET /profile
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path.
 * @param {function} middleware - Express middleware for authentication.
 * @param {function} handler - Request handler.
 */
router.get("/profile", requireAuth, autoSyncClerkId, getCurrentUserProfile);

/**
 * Route to get a specific user's profile by ID.
 * @name GET /:userId
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication.
 * @param {function} handler - Request handler.
 */
router.get("/:userId", requireAuth, autoSyncClerkId, getUserProfileById);

/**
 * Route to update a user's information
 * @name PATCH /:userId
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication and authorization.
 * @param {function} handler - Request handler.
 */
router.patch(
  "/:userId",
  requireAuth,
  authorize(["Gestión de Usuarios"]),
  autoSyncClerkId,
  requireDbUser,
  updateUser
);

/**
 * Route to assign a role to a user.
 * @name PATCH /:userId/rol
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication.
 * @param {function} handler - Request handler.
 */
router.patch("/:userId/rol", requireAuth, authorize(["Gestión de Usuarios"]), autoSyncClerkId, requireDbUser, assignUserRole);

/**
 * Route to update user documents
 * @name PATCH /:userId/documents
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication and authorization.
 * @param {function} handler - Request handler.
 */
router.patch(
  "/:userId/documents",
  requireAuth,
  autoSyncClerkId,
  requireDbUser,
  uploadDocuments,
  handleUploadError,
  updateUserDocuments
);

/**
 * Route to delete a user (soft delete)
 * @name DELETE /:id
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with id parameter.
 * @param {function} middleware - Express middleware for authentication and authorization.
 * @param {function} handler - Request handler.
 */
router.delete(
  "/:id",
  requireAuth,
  authorize(["Gestión de Usuarios"]),
  autoSyncClerkId,
  requireDbUser,
  deleteUser
);

/**
 * Route to update a user own information
 * @name PATCH /:userId
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication and authorization.
 * @param {function} handler - Request handler.
 */
router.patch(
  "/own/:userId",
  requireAuth,
  autoSyncClerkId,
  requireDbUser,
  updateUser
);

/**
 * Route to get a user's certificate with presigned URL
 * @name GET /certificate/:userId
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication.
 * @param {function} handler - Request handler.
 */
router.get("/certificate/:userId", requireAuth, autoSyncClerkId, getUserCertificate);

/**
 * Route to regenerate a user's membership certificate
 * @name POST /certificate/:userId/regenerate
 * @function
 * @memberof module:routes/users
 * @inner
 * @param {string} path - Express path with userId parameter.
 * @param {function} middleware - Express middleware for authentication and admin authorization.
 * @param {function} handler - Request handler.
 */
router.post(
  "/certificate/:userId/regenerate",
  requireAuth,
  authorize(["Gestión de Usuarios"]),
  autoSyncClerkId,
  requireDbUser,
  regenerateCertificate
);

export default router;
