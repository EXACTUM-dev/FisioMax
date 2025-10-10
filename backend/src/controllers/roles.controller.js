/**
 * Version: 1.2.0 - Con endpoints separados
 * Roles controller - Roles y privilegios por separado
 */

import { 
  getAllRolesWithPrivileges, 
  getAllPrivileges 
} from "../models/roles.model.js";

/**
 * Get all roles with their privileges for display
 */
export async function getAllRoles(req, res) {
  try {
    const rolesWithPrivileges = await getAllRolesWithPrivileges();
    
    if (!Array.isArray(rolesWithPrivileges)) {
      console.error("getAllRolesWithPrivileges did not return an array:", rolesWithPrivileges);
      return res.status(500).json({
        success: false,
        error: "Error al obtener roles",
        message: "Formato de datos inválido"
      });
    }

    console.log("Roles obtenidos:", rolesWithPrivileges.length);
    
    const rolesFormatted = rolesWithPrivileges.map(role => {
      const privilegesArray = Array.isArray(role.privileges) ? role.privileges : [];
      
      return {
        id: role.IDRol,
        rol: role.nombre,
        descripcion: role.descripcion,
        privileges: privilegesArray.map(p => ({
          id: p.IDPrivilegio,
          name: p.nombre,
          descripcion: p.descripcion
        })),
        privilegiosText: privilegesArray
          .map(p => p.nombre)
          .join(', ') || 'Sin privilegios',
        users_count: 0,
        created_at: role.createdAt
      };
    });

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

/**
 * Get all privileges (independent of roles)
 */
export async function getAllPrivilegesController(req, res) {
  try {
    const privileges = await getAllPrivileges();
  
    if (!Array.isArray(privileges)) {
      console.error("getAllPrivileges did not return an array:", privileges);
      return res.status(500).json({
        success: false,
        error: "Error al obtener privilegios",
        message: "Formato de datos inválido"
      });
    }
    
    const formatted = privileges.map(p => ({
      id: p.IDPrivilegio,
      permisos: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria || "General",
      created_at: p.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching privileges:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener privilegios",
      message: error.message
    });
  }
}

/**
 * Nueva función: Obtener roles Y privilegios por separado
 * Útil para formularios de asignación
 */
export async function getRolesAndPrivilegesSeparate(req, res) {
  try {
    const [roles, privileges] = await Promise.all([
      getAllRolesWithPrivileges(),
      getAllPrivileges()
    ]);

    const rolesFormatted = Array.isArray(roles) ? roles.map(role => {
      const privilegesArray = Array.isArray(role.privileges) ? role.privileges : [];
      
      return {
        id: role.IDRol,
        rol: role.nombre,
        descripcion: role.descripcion,
        privileges: privilegesArray.map(p => ({
          id: p.IDPrivilegio,
          name: p.nombre,
          descripcion: p.descripcion
        })),
        privilegiosText: privilegesArray
          .map(p => p.nombre)
          .join(', ') || 'Sin privilegios',
        users_count: 0,
        created_at: role.createdAt
      };
    }) : [];

    const privilegesFormatted = Array.isArray(privileges) ? privileges.map(p => ({
      id: p.IDPrivilegio,
      permisos: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria || "General",
      created_at: p.createdAt
    })) : [];

    res.json({
      success: true,
      roles: rolesFormatted,
      privileges: privilegesFormatted,
      counts: {
        roles: rolesFormatted.length,
        privileges: privilegesFormatted.length
      }
    });
  } catch (error) {
    console.error("Error fetching roles and privileges:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener datos",
      message: error.message
    });
  }
}