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
      message: error.message,
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

    console.log("assignUserRole - Request received:", {
      userId,
      roleId,
      roleName,
      body: req.body
    });

    // Validate required fields
    if (!roleId && !roleName) {
      console.log("assignUserRole - Missing role information");
      return res.status(400).json({
        success: false,
        error: "Role ID or role name is required",
      });
    }

    // Validate userId
    if (!userId) {
      console.log("assignUserRole - Missing userId");
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    let role;
    
    // Find role by ID or name
    if (roleId) {
      console.log("assignUserRole - Finding role by ID:", roleId);
      role = await findRoleById(roleId);
    } else if (roleName) {
      console.log("assignUserRole - Finding role by name:", roleName);
      // Find role by name
      const roles = await getAllRolesFromDB();
      role = roles.find(r => r.nombre === roleName);
    }

    if (!role) {
      console.log("assignUserRole - Role not found");
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    console.log("assignUserRole - Role found:", role);

    // Assign role to user
    const result = await assignRoleToUser(userId, role.IDRol || role.id);

    console.log("assignUserRole - Role assigned successfully:", {
      userId,
      roleId: role.IDRol || role.id,
      roleName: role.nombre || role.name,
    });

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
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || "Error assigning role to user",
    });
  }
}