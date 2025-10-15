/**
 * @fileoverview Middleware for role verification with Clerk.
 * @author EXACTUM-dev
 * @version 1.0.0
 *
 * Veriffy if user has the required role in the claims.
 */

/**
 * Express middleware function that validates user roles
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void|Response} Either calls next() or returns a 403 error response
 */
export function requireRole(role) {
  return (req, res, next) => {
    // Extract user roles from session claims with optional chaining and fallback to empty array
    const userRoles = req.auth?.sessionClaims?.metadata?.roles || [];

    // Check if the user has the required role
    if (!userRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: `You don't have permission to access this resource`,
      });
    }

    // User has the required role, proceed to the next middleware or route handler
    next();
  };
}
