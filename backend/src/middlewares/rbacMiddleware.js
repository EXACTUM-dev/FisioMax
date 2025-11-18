/**
 * @fileoverview Middleware to handle role-based access control (RBAC).
 * @version 0.1.1
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
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId)
      return res.status(401).json({ message: "No autenticado" });

    // Allow users to update their own profile without specific privileges
    const paramUserId = req.params?.userId;
    if (req.method === "PATCH" && paramUserId) {
      try {
        const userDb = await import("../models/users.model.js").then((m) =>
          m.getUserByClerkId(clerkUserId)
        );
        if (userDb && String(userDb.IDUsuario) === String(paramUserId)) {
          return next();
        }
      } catch (err) {
        console.error("Error verificando usuario propio en RBAC:", err);
      }
    }

    try {
      const { privilegios } = await getUserRolesAndPermissions(clerkUserId);
      const hasPermission = requiredPrivileges.every((p) =>
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
