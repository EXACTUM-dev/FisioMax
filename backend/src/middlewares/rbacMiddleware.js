// middleware/rbacMiddleware.js
import { rolePermissions } from "../models/role.js";

export const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    const user = req.user; // req.user debe venir del middleware de autenticación

    if (!user || !user.role) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userPerms = rolePermissions[user.role] || [];

    const hasPermission = requiredPermissions.every(p =>
      userPerms.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};
