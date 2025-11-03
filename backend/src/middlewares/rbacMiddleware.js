/**
 * @fileoverview Middleware to handle role-based access control (RBAC).
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Validates whether the authenticated user has the required privileges 
 *              to access specific routes or perform certain actions.
 */

import { getUserRolesAndPermissions } from "../models/rbac.model.js";

/**
 * Middleware factory that verifies if the authenticated user has the required privileges.
 * @param {string[]} [requiredPrivileges=[]] - Array of privileges required to access a route.
 * @returns {Function} Express middleware that checks the user's permissions.
 */
export const authorize = (requiredPrivileges = []) => {
  return async (req, res, next) => {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    try {
      const { privilegios } = await getUserRolesAndPermissions(userId);
      const hasPermission = requiredPrivileges.every(p =>
        privilegios.includes(p)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error verificando permisos" });
    }
  };
};
