/**
 * @fileoverview Route to fetch user names from the database model.
 * Defines the endpoint to retrieve user names.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from "express";
import { getCurrentUserProfile, getUserProfileById, getAllUsers } from "../controllers/users.controller.js";
import { assignUserRole } from "../controllers/roles.controller.js";
import { requireAuth, autoSyncClerkId } from "../middlewares/clerkAuth.js";
import { requireDbUser } from "../middlewares/requireDbUser.js";

const router = express.Router();

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
router.get("/:userId", requireAuth, getUserProfileById);

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
router.patch("/:userId/rol", requireAuth, autoSyncClerkId, requireDbUser, assignUserRole);

export default router;
