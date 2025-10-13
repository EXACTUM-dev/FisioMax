/**
 * Version: 0.3.0
 * Roles controller - Handles role management operations
 */

import {
  findRoleById,
  updateRoleById,
  getAllRolesFromDB,
  updateRolePrivileges,
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
 * Update a role and its privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { name, privileges } = req.body;

    // Authorization is now handled by middleware

    // Validate input
    if (!name || !Array.isArray(privileges)) {
      return res.status(400).json({
        success: false,
        error: "Name and privileges array are required",
      });
    }

    // Update role name
    await updateRoleById(id, { name });

    // Update role privileges
    await updateRolePrivileges(id, privileges);

    res.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({
      success: false,
      error: "Error updating role",
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
