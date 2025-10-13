/**
 * Version: 2.0.0 - Consultas separadas
 * Role model - Consultas separadas para mayor flexibilidad
 */

import { dbPool } from "../../config.js";

/**
 * Obtiene todos los roles con SOLO los privilegios asignados a cada uno
 * Si un rol no tiene privilegios asignados, retorna el rol con privileges: []
 */
export async function getAllRolesWithPrivileges() {
  try {
    const [roles] = await dbPool.query(
      `SELECT IDRol, nombre, descripcion, createdAt 
       FROM Rol 
       WHERE deletedAt IS NULL AND eliminado = 0
       ORDER BY nombre`
    );

    const [assignedPrivileges] = await dbPool.query(
      `SELECT rp.IDRol, p.IDPrivilegio, p.nombre, p.descripcion
       FROM RolPrivilegios rp
       INNER JOIN Privilegio p ON rp.IDPrivilegio = p.IDPrivilegio
       WHERE rp.deletedAt IS NULL AND rp.eliminado = 0
       AND p.deletedAt IS NULL
       ORDER BY p.nombre`
    );

    const privilegesByRoleId = new Map();
    
    for (const privilege of assignedPrivileges) {
      if (!privilegesByRoleId.has(privilege.IDRol)) {
        privilegesByRoleId.set(privilege.IDRol, []);
      }
      privilegesByRoleId.get(privilege.IDRol).push({
        IDPrivilegio: privilege.IDPrivilegio,
        nombre: privilege.nombre,
        descripcion: privilege.descripcion
      });
    }

    const rolesWithPrivileges = roles.map(rol => ({
      ...rol,
      privileges: privilegesByRoleId.get(rol.IDRol) || []
    }));

    return rolesWithPrivileges;

  } catch (error) {
    console.error("Database error in getAllRolesWithPrivileges:", error);
    throw error;
  }
}

/**
 * Obtiene todos los privilegios disponibles en el sistema
 */
export async function getAllPrivileges() {
  try {
    const [privileges] = await dbPool.query(
      `SELECT IDPrivilegio, nombre, descripcion, createdAt
       FROM Privilegio 
       WHERE deletedAt IS NULL
       ORDER BY nombre`
    );
    return privileges;
  } catch (error) {
    console.error("Database error in getAllPrivileges:", error);
    throw error;
  }
}

/**
 * Obtener un rol específico con sus privilegios
 */
export async function getRoleByIdWithPrivileges(roleId) {
  try {
    const [roles] = await dbPool.query(
      `SELECT IDRol, nombre, descripcion, createdAt 
       FROM Rol 
       WHERE IDRol = ? AND deletedAt IS NULL AND eliminado = 0`,
      [roleId]
    );

    if (roles.length === 0) {
      return null;
    }

    const [privileges] = await dbPool.query(
      `SELECT p.IDPrivilegio, p.nombre, p.descripcion
       FROM RolPrivilegios rp
       INNER JOIN Privilegio p ON rp.IDPrivilegio = p.IDPrivilegio
       WHERE rp.IDRol = ? AND rp.deletedAt IS NULL AND rp.eliminado = 0
       AND p.deletedAt IS NULL
       ORDER BY p.nombre`,
      [roleId]
    );

    return {
      ...roles[0],
      privileges: privileges
    };

  } catch (error) {
    console.error("Database error in getRoleByIdWithPrivileges:", error);
    throw error;
  }
}


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
    console.error("Database error in findRoleById:", error);
    throw error;
  }
}

/**
 * Update role by ID
 * @param {string} id - Role ID to update
 * @param {Object} data - Data to update (name)
 * @returns {Promise<Object>} - Result of the update operation
 */
export async function updateRoleById(id, { name }) {
  try {
    const [result] = await dbPool.query(
      "UPDATE rol SET nombre = ? WHERE IDRol = ? AND deletedAt IS NULL AND eliminado = 0",
      [name, id]
    );
    return result;
  } catch (error) {
    console.error("Database error in updateRoleById:", error);
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
    console.error("Database error in getAllRolesFromDB:", error);
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
      await connection.query(
        "INSERT INTO rolprivilegios (IDPrivilegio, IDRol) VALUES (?, ?)",
        [privilegeId, roleId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Database error in updateRolePrivileges:", error);
    throw error;
  } finally {
    connection.release();
  }
}