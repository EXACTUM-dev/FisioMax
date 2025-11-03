/**
 * @fileoverview Controller for role management operations
 * @version 0.3.1
 * @author EXACTUM-dev
 */

import {
  findRoleById,
  updateRoleById,
  getAllRolesFromDB,
  updateRolePrivileges,
  createRoleWithPrivileges,
  assignRoleToUser,
  findRoleByName,
  reassignUsersToRole,
  markRoleDeleted,
  markRolePrivilegesDeleted,
} from "../models/roles.model.js";
import {
  getRolePrivileges,
  getAllPrivileges,
} from "../models/privileges.model.js";
import crypto from "crypto";

/**
 * Get role by ID for editing with privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRoleById(req, res) {
  try {
    const { id } = req.params;

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
 * Get necessary data for role creation
 * @route GET /api/roles/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getCreateRole(req, res) {
  try {
    // Reusing existing getAllPrivileges function
    const allPrivileges = await getAllPrivileges();

    // Map privileges for the UI
    const privileges = allPrivileges.map((privilege) => ({
      id: privilege.id,
      name: privilege.name,
      checked: false,
    }));

    // Return privileges list
    res.json({
      success: true,
      data: {
        privileges,
      },
    });
  } catch (error) {
    console.error("Error fetching privileges for role creation:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching privileges for role creation",
    });
  }
}

/**
 * Create a new role with the specified privileges
 * @route POST /api/roles/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function createRole(req, res) {
  try {
    const { name, description, privileges } = req.body;

    // Validate required fields
    if (!name || !Array.isArray(privileges)) {
      return res.status(400).json({
        success: false,
        error: "Name and privileges array are required",
      });
    }

    // Let DB generate the ID and return it
    const createdRole = await createRoleWithPrivileges(
      { name, description },
      privileges
    );

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: {
        id: createdRole.id,
        name,
        description,
        privileges,
      },
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error creating role",
    });
  }
}
/*
 * Assigns a role to a specific user.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Promise<void>}
 */
export async function assignUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { roleId, roleName } = req.body;

    if (!roleId && !roleName) {
      return res.status(400).json({
        success: false,
        error: "Role ID o role name es requerido",
      });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID es requerido",
      });
    }

    let role;

    // Find role by ID or name
    if (roleId) {
      role = await findRoleById(roleId);
    } else if (roleName) {
      const roles = await getAllRolesFromDB();
      role = roles.find((r) => r.nombre === roleName);
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Rol no encontrado",
      });
    }

    await assignRoleToUser(userId, role.IDRol || role.id);

    return res.status(200).json({
      success: true,
      message: "Rol asignado exitosamente",
      data: {
        userId,
        roleId: role.IDRol || role.id,
        roleName: role.nombre || role.name,
      },
    });
  } catch (error) {
    console.error("Error asignando rol a usuario:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error asignando rol a usuario",
    });
  }
}

/**
 * Delete a role with logical deletion and user reassignment to "SinRol".
 * @param {Object} req - Express request object with role ID in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 */
export async function deleteRole(req, res) {
  try {
    const { id: roleId } = req.params;

    // 1) Check if trying to delete "SinRol" (not allowed)
    const roleToDelete = await findRoleById(roleId);
    if (roleToDelete && roleToDelete.nombre === "SinRol") {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el rol "SinRol". Es un rol del sistema.',
      });
    }

    // 2) Find "SinRol" role (required for user reassignment)
    const sinRol = await findRoleByName("SinRol");
    if (!sinRol) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo encontrar el rol "SinRol".',
      });
    }

    // 3) Reassign all users from this role to "SinRol" (simple UPDATE for 1:1)
    await reassignUsersToRole(roleId, sinRol.IDRol);

    // 4) Soft-delete all privileges associated with the role
    await markRolePrivilegesDeleted(roleId);

    // 5) Soft-delete the role itself
    await markRoleDeleted(roleId);

    return res.status(200).json({
      success: true,
      message: "El rol ha sido eliminado exitosamente",
    });
  } catch (error) {
    // Check for database connectivity errors
    const isConnError =
      error?.code === "ECONNREFUSED" ||
      error?.code === "PROTOCOL_CONNECTION_LOST" ||
      error?.code === "ER_ACCESS_DENIED_ERROR" ||
      /connect|connection|pool/i.test(error?.message || "");

    if (isConnError) {
      return res.status(503).json({
        success: false,
        message: "No hay conexión con el servidor. Intenta más tarde",
      });
    }

    // Generic error handling
    console.error("deleteRole error:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo eliminar el rol. Por favor, intente nuevamente",
    });
  }
}
