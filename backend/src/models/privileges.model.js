/**
 * @fileoverview Privilege model - Database interaction for privileges
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import { dbPool } from "../../config.js";

/**
 * Get all privileges for a specific role
 * @param {string} roleId - Role ID to get privileges for
 * @returns {Promise<Array>} - Array of privilege objects
 */
export async function getRolePrivileges(roleId) {
  try {
    const [rows] = await dbPool.query(
      `SELECT p.IDPrivilegio as id, p.nombre as name, p.descripcion as description
       FROM privilegio p
       INNER JOIN rolprivilegios rp ON p.IDPrivilegio = rp.IDPrivilegio
       WHERE rp.IDRol = ? AND rp.eliminado = 0 AND rp.deletedAt IS NULL`,
      [roleId]
    );
    return rows;
  } catch (error) {
    console.error("Error de base de datos en getRolePrivileges:", error);
    throw error;
  }
}

/**
 * Get all available privileges in the system
 * @returns {Promise<Array>} - Array of all privilege objects
 */
export async function getAllPrivileges() {
  try {
    const [rows] = await dbPool.query(
      `SELECT IDPrivilegio as id, nombre as name, descripcion as description
       FROM privilegio
       WHERE deletedAt IS NULL`
    );
    return rows;
  } catch (error) {
    console.error("Error de base de datos en getAllPrivileges:", error);
    throw error;
  }
}
