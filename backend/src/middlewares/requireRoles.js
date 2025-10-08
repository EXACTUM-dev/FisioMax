/**
 * @fileoverview Middleware para verificar roles en Clerk.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Verifica que el usuario tenga el rol requerido en los claims.
 */
export function requireRole(role) {
  return (req, res, next) => {
    const userRoles = req.auth?.sessionClaims?.metadata?.roles || [];
    if (!userRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: `You don't have permission to access this resource`,
      });
    }
    next();
  };
}
