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
 * Retrieves the membership status ("aceptado") of a specific user.
 * @async
 * @param {number|string} userId - The unique identifier of the user.
 * @returns {Promise<number|null>} - Returns `1` if the membership is accepted, `0` if the membership is denied, and `NULL` if the membership is pending.
 * @throws {Error} Throws an error if the database query fails.
 */
export async function getMembershipUserStateById(userId) {
  try {
    const [rows] = await dbPool.query(
      `SELECT aceptado FROM membresia WHERE IDUsuario = ?;`, [userId]
    );
    return rows[0]?.aceptado ?? null;
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
export async function getUserByClerkId(clerkId) {
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

    // Try to get additional documents if the table exists
    try {
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
    } catch (docError) {
      // If DocumentosAdicionales table doesn't exist, just set empty array
      console.warn(
        "DocumentosAdicionales table not found or error:",
        docError.message
      );
      user.documentosAdicionales = [];
    }

    return user;
  } catch (error) {
    console.error("Error al obtener usuario por Clerk ID:", error);
    throw error;
  }
}

// Alias for backward compatibility
export const getUsuarioByClerkId = getUserByClerkId;

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
        u.calle,
        u.numExterior,
        u.numInterior,
        u.colonia,
        u.codigoPostal,
        u.instagram,
        u.linkedin,
        u.facebook,
        u.paginaWeb,
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
        u.calle,
        u.numExterior,
        u.numInterior,
        u.colonia,
        u.codigoPostal,
        u.instagram,
        u.linkedin,
        u.facebook,
        u.paginaWeb,
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
      throw new Error("No se pudo crear el usuario");
    }

    const sinRol = await findRoleByName("SinRol");

    if (sinRol) {
      await connection.query(
        `INSERT INTO usuariorol (IDUsuario, IDRol) 
         VALUES (?, ?)`,
        [IDUsuario, sinRol.IDRol]
      );
    } else {
      console.warn('"SinRol" not found - user created without role assignment');
    }

    await connection.commit();

    return await getUserById(IDUsuario);
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear usuario con clerkID:", error);
    throw error;
  } finally {
    connection.release();
  }
}
