/**
 * Version: 1.0.0 SIMPLE
 * Roles controller - Solo mostrar roles y privilegios
 */

import { getAllRolesWithPrivileges } from "../models/roles.model.js";

/**
 * Get all roles with their privileges for display
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getAllRoles(req, res) {
  try {
    const rolesWithPrivileges = await getAllRolesWithPrivileges();
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(rolesWithPrivileges)) {
      console.error("getAllRolesWithPrivileges did not return an array:", rolesWithPrivileges);
      return res.status(500).json({
        success: false,
        error: "Error al obtener roles",
        message: "Formato de datos inválido"
      });
    }
    
    // Formatear para el frontend
    const rolesFormatted = rolesWithPrivileges.map(role => ({
      id: role.IDRol,
      rol: role.nombre,
      descripcion: role.descripcion,
      privileges: (role.privileges || []).map(p => ({
        id: p.IDPrivilegio,
        name: p.nombre,
        descripcion: p.descripcion
      })),
      // Mostrar privilegios como string para la tabla
      privilegiosText: (role.privileges || [])
        .map(p => p.nombre)
        .join(', ') || 'Sin privilegios',
      users_count: 0,
      created_at: role.createdAt
    }));

    res.json(rolesFormatted);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener roles",
      message: error.message
    });
  }
}