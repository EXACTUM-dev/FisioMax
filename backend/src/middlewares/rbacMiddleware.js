// middleware/rbacMiddleware.js
import { getUserRolesAndPermissions } from "../models/role.js";

export const authorize = (requiredPrivileges = []) => {
  return async (req, res, next) => {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    try {
      const { privilegios } = await getUserRolesAndPermissions(userId);
      console.log(privilegios);
      console.log(requiredPrivileges);
      const hasPermission = requiredPrivileges.every(p =>
        privilegios.includes(p)
      );

      if (!hasPermission) {
        console.log("Acceso denegado");
        return res.status(403).json({ message: "Acceso denegado" });
      }
      console.log("Acceso concedido");
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error verificando permisos" });
    }
  };
};
