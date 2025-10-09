/**
 * Version: 1.0.0 SIMPLE
 * Role model - Solo lectura de roles y privilegios
 */

import { dbPool } from "../../config.js";


export async function getAllRolesWithPrivileges() {
  try {
    const [roles] = await dbPool.query(
      `SELECT IDRol, nombre, descripcion, createdAt
       FROM Rol 
       WHERE deletedAt IS NULL AND eliminado = 0
       ORDER BY nombre`
    );

    // Para cada rol, obtener sus privilegios
    for (const role of roles) {
      const [privileges] = await dbPool.query(
        
        `SELECT p.IDPrivilegio, p.nombre, p.descripcion
         FROM Privilegio p
         INNER JOIN RolPrivilegios rp ON p.IDPrivilegio = rp.IDPrivilegio
         WHERE rp.IDRol = ? AND rp.deletedAt IS NULL AND rp.eliminado = 0
         ORDER BY p.nombre`,
        [role.IDRol]
      );
      
      role.privileges = privileges;
    }

    return roles;
  } catch (error) {
    console.error("Database error in getAllRolesWithPrivileges:", error);
    throw error;
  }
}