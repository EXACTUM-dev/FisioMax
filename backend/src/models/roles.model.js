/**
 * @fileoverview Role model - Database interaction for roles
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Provides CRUD operations for roles and role-privilege assignments.
 */

import { dbPool } from "../../config.js";

/**
 * Find a role by its ID.
 * @param {string|number} id - Role ID to search.
 * @returns {Promise<Object|null>} Role object or null if not found.
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
 * Get all roles from database with their privileges (comma-separated).
 * @returns {Promise<Array>} Array of role objects with privileges string.
 */
export async function getAllRolesFromDB() {
  try {
    const [rows] = await dbPool.query(
      `SELECT 
        r.IDRol, 
        r.nombre, 
        r.descripcion,
        GROUP_CONCAT(p.nombre SEPARATOR ', ') AS privilegios
      FROM rol r
      LEFT JOIN rolprivilegios rp 
        ON r.IDRol = rp.IDRol 
       AND rp.deletedAt IS NULL 
       AND rp.eliminado = 0
      LEFT JOIN privilegio p 
        ON rp.IDPrivilegio = p.IDPrivilegio
      WHERE r.deletedAt IS NULL 
        AND r.eliminado = 0
      GROUP BY r.IDRol, r.nombre, r.descripcion`
    );
    return rows;
  } catch (error) {
    console.error("Error de base de datos en getAllRolesFromDB:", error);
    throw error;
  }
}

/**
 * Update role by ID (name and description).
 * @param {string|number} id - Role ID to update.
 * @param {{name:string, description:string}} data - Data to update.
 * @returns {Promise<Object>} Result of the update operation.
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
 * Update role privileges in a transaction (soft delete + upsert).
 * @param {string|number} roleId - Role ID.
 * @param {Array<string|number>} privileges - Privilege IDs to assign.
 * @returns {Promise<void>}
 */
export async function updateRolePrivileges(roleId, privileges) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Soft-delete all current privileges
    await connection.query(
      "UPDATE rolprivilegios SET eliminado = 1, deletedAt = NOW() WHERE IDRol = ?",
      [roleId]
    );

    // Reactivate existing or insert new links
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

/**
 * Get user role by user ID.
 * @param {number} userId - User ID.
 * @returns {Promise<Object|null>} Role object or null if not found.
 */
export async function getUserRole(userId) {
  try {
    const [rows] = await dbPool.query(
      `SELECT r.IDRol, r.nombre, r.descripcion
         FROM rol r
         INNER JOIN usuariorol ur ON r.IDRol = ur.IDRol
        WHERE ur.IDUsuario = ?
          AND ur.deletedAt IS NULL
          AND ur.eliminado = 0
          AND r.deletedAt IS NULL
          AND r.eliminado = 0
        LIMIT 1`,
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error de base de datos en getUserRole:", error);
    throw error;
  }
}

/**
 * Assign a role to a user (soft delete previous and upsert the new one).
 * @param {number} userId - User ID.
 * @param {number} roleId - Role ID to assign.
 * @returns {Promise<{success:boolean}>} Operation result.
 */
export async function assignRoleToUser(userId, roleId) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Soft-delete all current role assignments for the user
    await connection.query(
      "UPDATE usuariorol SET eliminado = 1, deletedAt = NOW() WHERE IDUsuario = ?",
      [userId]
    );

    // Reactivate if the same relation exists, otherwise insert new
    const [existing] = await connection.query(
      "SELECT 1 FROM usuariorol WHERE IDUsuario = ? AND IDRol = ? LIMIT 1",
      [userId, roleId]
    );

    if (existing.length > 0) {
      await connection.query(
        "UPDATE usuariorol SET eliminado = 0, deletedAt = NULL WHERE IDUsuario = ? AND IDRol = ?",
        [userId, roleId]
      );
    } else {
      await connection.query(
        "INSERT INTO usuariorol (IDUsuario, IDRol) VALUES (?, ?)",
        [userId, roleId]
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error de base de datos en assignRoleToUser:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Create a new role with privileges.
 * @param {{name:string, description?:string}} roleData - Role data.
 * @param {Array<string|number>} privileges - Privilege IDs.
 * @returns {Promise<{id:number, name:string, description:string}>} Created role.
 */
export async function createRoleWithPrivileges(
  { name, description = "" },
  privileges = []
) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert role (auto-increment ID)
    const [result] = await connection.query(
      "INSERT INTO rol (nombre, descripcion) VALUES (?, ?)",
      [name, description]
    );
    const roleId = result.insertId;

    // Insert privileges if any
    for (const privilegeId of privileges) {
      await connection.query(
        "INSERT INTO rolprivilegios (IDPrivilegio, IDRol) VALUES (?, ?)",
        [privilegeId, roleId]
      );
    }

    await connection.commit();
    return { id: roleId, name, description };
  } catch (error) {
    await connection.rollback();
    console.error("Database error in createRoleWithPrivileges:", error);
    throw error;
  } finally {
    connection.release();
  }
}
