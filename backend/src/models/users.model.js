/**
 * @fileoverview User model - Database interaction for users.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";

/**
 * Get all users with their assigned roles from the database.
 * Performs a LEFT JOIN with usuariorol and rol tables to include role information.
 * @returns {Promise<Array>} Array of user objects with role information.
 */
export async function getUsuarios() {
  try {
    const [rows] = await dbPool.query(
      `SELECT 
        u.IDUsuario,
        u.clerkID,
        u.nombres, 
        u.apellidoP, 
        u.apellidoM,
        u.foto,
        u.correo,
        u.telefono,
        u.fechaNacimiento,
        r.IDRol,
        r.nombre as rolNombre,
        r.descripcion as rolDescripcion
      FROM usuario u
      LEFT JOIN usuariorol ur ON u.IDUsuario = ur.IDUsuario 
        AND ur.deletedAt IS NULL 
        AND ur.eliminado = 0
      LEFT JOIN rol r ON ur.IDRol = r.IDRol 
        AND r.deletedAt IS NULL 
        AND r.eliminado = 0
      WHERE u.deletedAt IS NULL 
        AND u.eliminado = 0`
    );
    return rows;
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    throw error; // Throw error to be handled by controller
  }
}

/**
 * Get a single user by Clerk ID with all their information including documents
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<Object|null>} User object with all data or null if not found
 */
export async function getUsuarioByClerkId(clerkId) {
  try {
    const [rows] = await dbPool.query(
      `SELECT 
        u.IDUsuario,
        u.clerkID,
        u.nombres,
        u.apellidoP,
        u.apellidoM,
        u.foto,
        u.correo,
        u.telefono,
        u.fechaNacimiento,
        u.cedula,
        u.titulo,
        u.constancias,
        u.licenciatura,
        u.pais,
        u.estado,
        u.ciudad,
        u.calle,
        u.numExterior,
        u.numInterior,
        u.colonia,
        u.codigoPostal,
        u.instagram,
        u.linkedin,
        u.facebook,
        u.paginaWeb,
        u.createdAt,
        r.IDRol,
        r.nombre as rolNombre,
        r.descripcion as rolDescripcion
      FROM usuario u
      LEFT JOIN usuariorol ur ON u.IDUsuario = ur.IDUsuario 
        AND ur.deletedAt IS NULL 
        AND ur.eliminado = 0
      LEFT JOIN rol r ON ur.IDRol = r.IDRol 
        AND r.deletedAt IS NULL 
        AND r.eliminado = 0
      WHERE u.clerkID = ? 
        AND u.eliminado = 0
      LIMIT 1`,
      [clerkId]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    const [docRows] = await dbPool.query(
      `SELECT 
        IDDocumento,
        nombreArchivo,
        urlArchivo,
        createdAt
      FROM DocumentosAdicionales
      WHERE IDUsuario = ?`,
      [user.IDUsuario]
    );

    user.documentosAdicionales = docRows;

    return user;
  } catch (error) {
    console.error("Error al obtener usuario por Clerk ID:", error);
    throw error;
  }
}
