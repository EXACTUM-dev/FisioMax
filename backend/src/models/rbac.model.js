
/**
 * @fileoverview Rbac model - Database interaction for RBAC
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";

/**
 * Get all roles and privileges for a specific user
 * @param {string} clerkId - Clerk user ID to retrieve roles and privileges for
 * @returns {Promise<{roles: string[], privilegios: string[]}>} - Object containing arrays of roles and privileges
 */
export const getUserRolesAndPermissions = async (clerkId) => {
  const [rows] = await dbPool.query(
    `
      SELECT
        r.nombre AS rol,
        p.nombre AS privilegio
      FROM usuario u
      JOIN membresia m ON u.IDUsuario = m.IDUsuario
      JOIN usuarioRol ur ON u.IDUsuario = ur.IDUsuario
      JOIN rol r ON ur.IDRol = r.IDRol
      JOIN rolprivilegios rp ON r.IDRol = rp.IDRol
      JOIN privilegio p ON rp.IDPrivilegio = p.IDPrivilegio
      WHERE
        u.clerkID = ?
        AND u.eliminado = 0
        AND r.eliminado = 0
        AND m.aceptado = 1
        AND m.deletedAt IS NULL
    `,
    [clerkId]
  );

  const roles = [...new Set(rows.map(r => r.rol))];
  const privilegios = [...new Set(rows.map(r => r.privilegio))];

  return { roles, privilegios };
};

