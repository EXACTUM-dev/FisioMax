/**
 * @fileoverview Route to fetch user names from the database model.
 * Defines the endpoint to retrieve user names.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from "express";
import multer from "multer";
import { getCurrentUserProfile, getUserProfileById, getAllUsers, updateUser, updateUserDocuments, deleteUser } from "../controllers/users.controller.js";
import { assignUserRole } from "../controllers/roles.controller.js";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import { requireDbUser } from "../middlewares/requireDbUser.js";
import {authorize} from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware to handle document file uploads
const uploadDocuments = upload.fields([
  { name: 'titulo', maxCount: 1 },
  { name: 'cedula', maxCount: 1 },
  { name: 'constancias', maxCount: 1 },
]);

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
router.get("/profile", requireAuth, getCurrentUserProfile);

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
router.get("/:userId", requireAuth, authorize(["Gestión de Usuarios"]), getUserProfileById);

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
  authorize(["Gestión de Usuarios"]),
  autoSyncClerkId,
  requireDbUser,
  uploadDocuments,
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

export default router;
