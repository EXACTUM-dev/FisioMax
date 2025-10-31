
import { dbPool } from "../../config.js";

export const getUserRolesAndPermissions = async (idUsuario) => {
  const [rows] = await dbPool.query(
    `SELECT r.nombre AS rol, p.nombre AS privilegio FROM Usuario u JOIN Membresia m ON u.IDUsuario = m.IDUsuario JOIN UsuarioRol ur ON u.IDUsuario = ur.IDUsuario JOIN Rol r ON ur.IDRol = r.IDRol JOIN RolPrivilegios rp ON r.IDRol = rp.IDRol JOIN Privilegio p ON rp.IDPrivilegio = p.IDPrivilegio WHERE u.clerkID = ? AND u.eliminado = 0 AND r.eliminado = 0 AND m.aceptado = 1 AND m.deletedAt IS NULL`,
    [idUsuario]
  );

  // Estructuramos la respuesta
  const roles = [...new Set(rows.map(r => r.rol))];
  const privilegios = [...new Set(rows.map(r => r.privilegio))];

  return { roles, privilegios };
};

