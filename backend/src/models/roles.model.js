/**
 * @fileoverview Role model - Database interaction for roles
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import { dbPool } from "../../config.js";

/**
 * Find a role by its ID
 * @param {string} id - Role ID to search
 * @returns {Promise<Object|null>} - Role object or null if not found
 */
export async function findRoleById(id) {
  try {
    const [rows] = await dbPool.query(
      "SELECT * FROM rol WHERE IDRol = ? AND deletedAt IS NULL AND eliminado = 0",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error de base de datos en findRoleById:", error);
    throw error;
  }
}

/**
 * Get all roles from database
 * @returns {Promise<Array>} - Array of role objects
 */
export async function getAllRolesFromDB() {
  try {
    const [rows] = await dbPool.query(
      "SELECT IDRol, nombre, descripcion FROM rol WHERE deletedAt IS NULL AND eliminado = 0"
    );
    return rows;
  } catch (error) {
    console.error("Error de base de datos en getAllRolesFromDB:", error);
    throw error;
  }
}

/**
 * Update role by ID
 * @param {string} id - Role ID to update
 * @param {Object} data - Data to update (name, description)
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateRoleById(id, { name, description }) {
  try {
    const [result] = await dbPool.query(
      "UPDATE rol SET nombre = ?, descripcion = ? WHERE IDRol = ? AND deletedAt IS NULL AND eliminado = 0",
      [name, description, id]
    );
    return result;
  } catch (error) {
    console.error("Error de base de datos en updateRoleById:", error);
    throw error;
  }
}

/**
 * Update role privileges
 * @param {string} roleId - Role ID
 * @param {Array<string>} privileges - Array of privilege IDs to assign
 * @returns {Promise<void>}
 */
export async function updateRolePrivileges(roleId, privileges) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    // Delete all current privileges for this role (soft delete)
    await connection.query(
      "UPDATE rolprivilegios SET eliminado = 1, deletedAt = NOW() WHERE IDRol = ?",
      [roleId]
    );

    // Insert new privileges
    for (const privilegeId of privileges) {
      const [result] = await connection.query(
        "UPDATE rolprivilegios SET eliminado = 0, deletedAt = NULL WHERE IDRol = ? AND IDPrivilegio = ?",
        [roleId, privilegeId]
      );
      if (result.affectedRows === 0) {
        await connection.query(
          "INSERT INTO rolprivilegios (IDPrivilegio, IDRol) VALUES (?, ?)",
          [privilegeId, roleId]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error de base de datos en updateRolePrivileges:", error);
    throw error;
  } finally {
    connection.release();
  }
}
