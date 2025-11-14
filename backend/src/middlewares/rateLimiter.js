/**
 * @fileoverview Rate limiting middlewares to protect endpoints from abuse.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import rateLimit from "express-rate-limit";
import config from "../../config.js";
import { getRequestIp } from "../utils/request.js";

/**
 * Rate limiter specifically for the login-errors endpoint.
 * Prevents abuse through IP-based throttling.
 *
 * Configured limits:
 * - Maximum 10 requests per IP every 15 minutes
 * - Allows legitimate error log registration but prevents spam/DoS attacks
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 * @constant
 */
export const loginErrorsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 requests per IP in the time window
  message: {
    success: false,
    error: "Too many requests",
    message: "You have exceeded the request limit. Please try again later.",
  },
  standardHeaders: true, // Returns rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disables `X-RateLimit-*` headers
  // Use custom IP to account for proxies
  keyGenerator: (req) => {
    return getRequestIp(req) || req.ip || "unknown";
  },
  // Custom handler for consistent responses
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many requests",
      message: "You have exceeded the request limit. Please try again later.",
    });
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * General rate limiter for APIs.
 * Can be used as a fallback or for other endpoints.
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 * @constant
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: {
    success: false,
    error: "Too many requests",
    message: "You have exceeded the API request limit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getRequestIp(req) || req.ip || "unknown";
  },
});

