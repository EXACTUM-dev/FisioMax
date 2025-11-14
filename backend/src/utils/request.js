/**
 * @fileoverview Utilities for handling HTTP request information.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * Gets the client IP address from the request, accounting for proxies.
 * Checks the X-Forwarded-For header first, then falls back to req.ip
 * or connection remoteAddress.
 *
 * @param {import("express").Request} req - Express request object
 * @returns {string|null} The client IP address or null if it cannot be determined
 */
export function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

