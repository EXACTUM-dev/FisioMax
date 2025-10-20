/**
 * Version: 0.3.0
 * Roles controller - Handles role management operations
 */

import {
  findRoleById,
  updateRoleById,
  getAllRolesFromDB,
  updateRolePrivileges,
  assignRoleToUser,
} from "../models/roles.model.js";
import {
  getRolePrivileges,
  getAllPrivileges,
} from "../models/privileges.model.js";

/**
 * Get role by ID for editing with privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRoleById(req, res) {
  try {
    const { id } = req.params;

    // Authorization is now handled by middleware

    // Get role data
    const role = await findRoleById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    // Get role privileges
    const rolePrivileges = await getRolePrivileges(id);

    // Get all available privileges
    const allPrivileges = await getAllPrivileges();

    // Map privileges for the UI
    const privileges = allPrivileges.map((privilege) => ({
      id: privilege.id,
      name: privilege.name,
      checked: rolePrivileges.some((rp) => rp.id === privilege.id),
    }));

    // Return role with mapped privileges
    res.json({
      success: true,
      data: {
        id: role.IDRol,
        name: role.nombre,
        description: role.descripcion,
        privileges,
      },
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching role",
    });
  }
}

/**
 * Update role name, description and privileges
 * @route POST /api/roles/edit/:id
 * @access Protected
 */
export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { name, description, privileges } = req.body;

    // Validate required fields
    if (!name || !Array.isArray(privileges)) {
      return res.status(400).json({
        success: false,
        error: "Name and privileges array are required",
      });
    }

    // Check if role exists
    const role = await findRoleById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    // Update role basic info (name and description)
    await updateRoleById(id, { name, description });

    // Update role privileges
    await updateRolePrivileges(id, privileges);

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: {
        id,
        name,
        description,
        privileges,
      },
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error updating role",
    });
  }
}

/**
 * Get all roles for listing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getAllRoles(req, res) {
  try {
    const roles = await getAllRolesFromDB();
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching roles",
    });
  }
}

/**
 * Assign role to a specific user
 * @route PATCH /api/usuarios/:userId/rol
 * @access Protected
 */
export async function assignUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { roleId, roleName } = req.body;

    // Validate required fields
    if (!roleId && !roleName) {
      return res.status(400).json({
        success: false,
        error: "Role ID or role name is required",
      });
    }

    let role;
    
    // Find role by ID or name
    if (roleId) {
      role = await findRoleById(roleId);
    } else if (roleName) {
      // Find role by name
      const roles = await getAllRolesFromDB();
      role = roles.find(r => r.nombre === roleName);
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    // Assign role to user
    await assignRoleToUser(userId, role.IDRol || role.id);

    return res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      data: {
        userId,
        roleId: role.IDRol || role.id,
        roleName: role.nombre || role.name,
      },
    });
  } catch (error) {
    console.error("Error assigning role to user:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error assigning role to user",
    });
  }
}


/**
 * Assign role to a user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID to assign
 * @returns {Promise<void>}
 */
export async function assignRoleToUser(userId, roleId) {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    // Soft delete current role assignment
    await connection.query(
      `UPDATE usuariorol 
       SET eliminado = 1, deletedAt = NOW() 
       WHERE IDUsuario = ? 
         AND deletedAt IS NULL 
         AND eliminado = 0`,
      [userId]
    );

    // Check if a relationship exists (soft deleted)
    const [existing] = await connection.query(
      `SELECT IDUsuarioRol 
       FROM usuariorol 
       WHERE IDUsuario = ? AND IDRol = ?
       LIMIT 1`,
      [userId, roleId]
    );

    if (existing.length > 0) {
      // Reactivate existing relationship
      await connection.query(
        `UPDATE usuariorol 
         SET eliminado = 0, deletedAt = NULL 
         WHERE IDUsuario = ? AND IDRol = ?`,
        [userId, roleId]
      );
    } else {
      // Create new relationship
      await connection.query(
        `INSERT INTO usuariorol (IDUsuario, IDRol) 
         VALUES (?, ?)`,
        [userId, roleId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error de base de datos assignRoleToUser:", error);
    throw error;
  } finally {
    connection.release();
  }
}