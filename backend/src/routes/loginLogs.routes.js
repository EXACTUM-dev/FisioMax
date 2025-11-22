/**
 * @fileoverview Routes for login error logs.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import express from "express";
import { createLoginErrorLog } from "../controllers/loginLogs.controller.js";
import { loginErrorsRateLimiter } from "../middlewares/rateLimiter.js";
import { validateLoginErrorLog } from "../middlewares/validateLoginErrorLog.js";

const router = express.Router();

/**
 * POST /login-errors endpoint.
 * Registers a login error with the following protections:
 * - Rate limiting: maximum 10 requests per IP every 15 minutes
 * - Input validation and sanitization for all fields
 * - Payload size limit (10KB)
 *
 * @route POST /login-errors
 * @middleware {Function} loginErrorsRateLimiter - Rate limiting middleware
 * @middleware {Function} validateLoginErrorLog - Validation and sanitization middleware
 * @controller {Function} createLoginErrorLog - Controller to create login error log
 */
router.post(
  "/login-errors",
  loginErrorsRateLimiter,
  validateLoginErrorLog,
  createLoginErrorLog
);

export default router;

