/**
 * @fileoverview Route to fetch user names from the database model.
 * Defines the endpoint to retrieve user names.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from "express";
import { getUsuarios } from "../models/users.model.js";

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
router.get("/", getUsuarios);

export default router;
