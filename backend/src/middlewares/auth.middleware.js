/**
 * @fileoverview Generic authentication middleware. The project already uses
 * `src/middlewares/clerkAuth.js` (ClerkExpressRequireAuth). This file
 * provides an alternative for validating Bearer tokens (custom JWT) if needed.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * JWT authentication middleware for validating custom Bearer tokens.
 * Note: This is not currently used as the project uses Clerk authentication.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - Request headers.
 * @param {string} req.headers.authorization - Authorization header with Bearer token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @return {Promise<void>}
 */
export async function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({error: 'Token no proporcionado'});
  }
  const token = match[1];
  try {
    const payload = verify(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Token inválido',
      detail: err?.message,
    });
  }
}
