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
        u.correo,
        u.telefonoCasa,
        u.telefonoWhatsapp,
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
 * Get a user by their Clerk ID
 * @param {string} clerkID - The Clerk user ID
 * @returns {Promise<Object|null>} User object with role information or null if not found
 */
export async function getUserByClerkId(clerkID) {
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
        u.telefonoCasa,
        u.telefonoWhatsapp,
        u.fechaNacimiento,
        u.cedula,
        u.titulo,
        u.constancias,
        u.licenciatura,
        u.pais,
        u.estado,
        u.ciudad,
        u.colonia,
        u.codigoPostal,
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
        AND u.deletedAt IS NULL 
        AND u.eliminado = 0
      LIMIT 1`,
      [clerkID]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al consultar usuario por clerkID:", error);
    throw error;
  }
}

/**
 * Get a user by their database ID (IDUsuario)
 * @param {string} userId - The database user ID
 * @returns {Promise<Object|null>} User object with role information or null if not found
 */
export async function getUserById(userId) {
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
        u.telefonoCasa,
        u.telefonoWhatsapp,
        u.fechaNacimiento,
        u.cedula,
        u.titulo,
        u.constancias,
        u.licenciatura,
        u.pais,
        u.estado,
        u.ciudad,
        u.colonia,
        u.codigoPostal,
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
      WHERE u.IDUsuario = ? 
        AND u.deletedAt IS NULL 
        AND u.eliminado = 0
      LIMIT 1`,
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al consultar usuario por ID:", error);
    throw error;
  }
}

/**
 * Get a user by their email address
 * @param {string} email - The user's email address
 * @returns {Promise<Object|null>} User object with role information or null if not found
 */
export async function getUserByEmail(email) {
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
        u.telefonoCasa,
        u.telefonoWhatsapp,
        u.fechaNacimiento,
        u.cedula,
        u.titulo,
        u.constancias,
        u.licenciatura,
        u.pais,
        u.estado,
        u.ciudad,
        u.colonia,
        u.codigoPostal,
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
      WHERE u.correo = ? 
        AND u.deletedAt IS NULL 
        AND u.eliminado = 0
      LIMIT 1`,
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al consultar usuario por email:", error);
    throw error;
  }
}

/**
 * Update a user's Clerk ID
 * @param {string} userId - The database user ID
 * @param {string} clerkID - The Clerk user ID to associate
 * @returns {Promise<boolean>} True if updated successfully
 */
export async function updateUserClerkId(userId, clerkID) {
  try {
    const [result] = await dbPool.query(
      `UPDATE usuario 
       SET clerkID = ? 
       WHERE IDUsuario = ? 
         AND deletedAt IS NULL 
         AND eliminado = 0`,
      [clerkID, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar clerkID del usuario:", error);
    throw error;
  }
}

/**
 * Create a new user with Clerk ID (for automatic sync from Clerk webhook)
 * @param {Object} userData - User data from Clerk
 * @returns {Promise<Object>} Created user object
 */
export async function createUserWithClerkId(userData) {
  try {
    const {
      clerkID,
      IDUsuario,
      nombres,
      apellidoP,
      apellidoM = null,
      correo,
      telefonoCasa = "",
      telefonoWhatsapp = "",
      fechaNacimiento = "",
      foto = null,
      pais = "México",
      estado = "",
      ciudad = null,
      colonia = null,
      codigoPostal = null,
    } = userData;

    const [result] = await dbPool.query(
      `INSERT INTO usuario 
        (IDUsuario, clerkID, nombres, apellidoP, apellidoM, correo, telefonoCasa, telefonoWhatsapp, fechaNacimiento, foto, pais, estado, ciudad, colonia, codigoPostal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        IDUsuario,
        clerkID,
        nombres,
        apellidoP,
        apellidoM,
        correo,
        telefonoCasa,
        telefonoWhatsapp,
        fechaNacimiento,
        foto,
        pais,
        estado,
        ciudad,
        colonia,
        codigoPostal,
      ]
    );

    if (result.affectedRows > 0) {
      return await getUserById(IDUsuario);
    }
    throw new Error("No se pudo crear el usuario");
  } catch (error) {
    console.error("Error al crear usuario con clerkID:", error);
    throw error;
  }
}
