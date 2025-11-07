/**
 * @fileoverview User model - Database interaction for users.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";
import { findRoleByName } from "./roles.model.js";

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
        r.descripcion as rolDescripcion,
        m.estatusPago as membresiaEstatusPago
      FROM usuario u
      LEFT JOIN membresia m ON u.IDUsuario = m.IDUsuario 
        AND m.aceptado = 1
        AND m.deletedAt IS NULL
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
      `SELECT aceptado, motivoRechazo FROM membresia WHERE IDUsuario = ?;`,
      [userId]
    );
    return rows[0] ?? null;
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
        r.descripcion as rolDescripcion,
        m.IDMembresia,
        m.tipo as membresiaTipo,
        m.fechaVencimiento as membresiaFechaVencimiento,
        m.createdAt as membresiaCreatedAt,
        m.horasFormacion as membresiaHorasFormacion,
        m.aceptado as membresiaAceptado,
        m.estatusPago as membresiaEstatusPago
      FROM usuario u
      LEFT JOIN usuariorol ur ON u.IDUsuario = ur.IDUsuario 
        AND ur.deletedAt IS NULL 
        AND ur.eliminado = 0
      LEFT JOIN rol r ON ur.IDRol = r.IDRol 
        AND r.deletedAt IS NULL 
        AND r.eliminado = 0
      LEFT JOIN membresia m ON u.IDUsuario = m.IDUsuario
        AND m.deletedAt IS NULL
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
        FROM documentosadicionales
        WHERE IDUsuario = ?`,
        [user.IDUsuario]
      );
      user.documentosadicionales = docRows;
    } catch (docError) {
      // If documentosadicionales table doesn't exist, just set empty array
      console.warn('documentosadicionales table not found or error:', docError.message);
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
        r.descripcion as rolDescripcion,
        m.IDMembresia,
        m.tipo as membresiaTipo,
        m.fechaVencimiento as membresiaFechaVencimiento,
        m.createdAt as membresiaCreatedAt,
        m.horasFormacion as membresiaHorasFormacion,
        m.aceptado as membresiaAceptado,
        m.estatusPago as membresiaEstatusPago
      FROM usuario u
      LEFT JOIN usuariorol ur ON u.IDUsuario = ur.IDUsuario 
        AND ur.deletedAt IS NULL 
        AND ur.eliminado = 0
      LEFT JOIN rol r ON ur.IDRol = r.IDRol 
        AND r.deletedAt IS NULL 
        AND r.eliminado = 0
      LEFT JOIN membresia m ON u.IDUsuario = m.IDUsuario
        AND m.deletedAt IS NULL
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
 * Update fields of a user by ID
 * Only updates the fields provided in updateData
 * @param {string|number} userId
 * @param {Object} updateData - allowed keys: nombres, apellidoP, apellidoM, correo, telefono, fechaNacimiento, licenciatura, pais, estado, ciudad, calle, numExterior, numInterior, colonia, codigoPostal, instagram, linkedin, facebook, paginaWeb, membershipType, membershipExpiresAt, membershipPaymentStatus
 * @returns {Promise<Object|null>} Updated user object or null if not found
 */
export async function updateUserById(userId, updateData) {
  const connection = await dbPool.getConnection();
  try {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    await connection.beginTransaction();

    const userAllowedFields = [
      'nombres', 'apellidoP', 'apellidoM', 'correo', 'telefonoCasa', 'telefonoWhatsapp', 'fechaNacimiento',
      'licenciatura', 'pais', 'estado', 'ciudad', 'calle', 'numExterior', 'numInterior',
      'colonia', 'codigoPostal', 'instagram', 'linkedin', 'facebook', 'paginaWeb',
      'titulo', 'cedula', 'constancias'
    ];

    const membershipAllowedFields = [
      'membershipType', 'membershipRegisteredAt', 'membershipExpiresAt', 'membershipPaymentStatus'
    ];

    const userSetClauses = [];
    const userValues = [];

    for (const field of userAllowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        userSetClauses.push(`${field} = ?`);
        userValues.push(updateData[field]);
      }
    }

    // Update usuario table if there are user fields to update
    if (userSetClauses.length > 0) {
      const userSql = `UPDATE usuario SET ${userSetClauses.join(', ')} WHERE IDUsuario = ? AND deletedAt IS NULL AND eliminado = 0`;
      userValues.push(userId);
      await connection.query(userSql, userValues);
    }

    // Update membresia table if there are membership fields to update
    const membershipSetClauses = [];
    const membershipValues = [];

    for (const field of membershipAllowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        let dbField = field;
        if (field === 'membershipType') dbField = 'tipo';
        else if (field === 'membershipRegisteredAt') dbField = 'createdAt';
        else if (field === 'membershipExpiresAt') dbField = 'fechaVencimiento';
        else if (field === 'membershipPaymentStatus') dbField = 'estatusPago';
        
        membershipSetClauses.push(`${dbField} = ?`);
        membershipValues.push(updateData[field]);
      }
    }

    if (membershipSetClauses.length > 0) {
      const membershipSql = `UPDATE membresia SET ${membershipSetClauses.join(', ')} WHERE IDUsuario = ? AND deletedAt IS NULL`;
      membershipValues.push(userId);
      const [result] = await connection.query(membershipSql, membershipValues);
      
      // If no membership exists, log a warning but don't fail
      if (result.affectedRows === 0) {
        console.warn(`No se encontró membresía para el usuario ${userId}`);
      }
    }

    await connection.commit();
    
    // Return updated user data
    const updatedUser = await getUserById(userId);
    return updatedUser;
    
  } catch (error) {
    await connection.rollback();
    console.error('Error actualizando usuario:', error);
    throw error;
  } finally {
    connection.release();
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

    if (result.affectedRows === 0) {
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

/**
 * Soft-deletes a user (logical deletion).
 * Marks the user as deleted by setting `eliminado` to 1 and `deletedAt` to the current timestamp.
 * @param {number|string} userId - The ID of the user to delete.
 * @returns {Promise<number>} Number of affected rows.
 */
export async function markUserDeleted(userId) {
  const [r] = await dbPool.query(
    `UPDATE usuario
        SET eliminado = 1, deletedAt = NOW()
      WHERE IDUsuario = ?
        AND deletedAt IS NULL
        AND (eliminado = 0 OR eliminado IS NULL)`
    , [userId]
  );
  return r.affectedRows;
}

/**
 * Reassign a user's role to "SinRol" if it exists.
 * If "SinRol" doesn't exist, just marks the user role as deleted.
 * @param {string|number} userId - User ID to reassign
 * @returns {Promise<boolean>} True if reassigned successfully or role marked as deleted
 */
export async function reassignUserToSinRol(userId) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Find "SinRol" role
    const [sinRolRows] = await connection.query(
      `SELECT IDRol FROM rol WHERE nombre = 'SinRol' AND deletedAt IS NULL AND eliminado = 0 LIMIT 1`
    );

    if (sinRolRows.length > 0) {
      // SinRol exists, reassign to it
      const sinRolId = sinRolRows[0].IDRol;

      // Update user's role assignment to SinRol
      await connection.query(
        `UPDATE usuariorol 
         SET IDRol = ?, eliminado = 0, deletedAt = NULL 
         WHERE IDUsuario = ?`,
        [sinRolId, userId]
      );
    } else {
      // SinRol doesn't exist, just mark the user's role as deleted
      console.warn('Rol "SinRol" no encontrado. Marcando rol de usuario como eliminado.');
      await connection.query(
        `UPDATE usuariorol 
         SET eliminado = 1, deletedAt = NOW() 
         WHERE IDUsuario = ?`,
        [userId]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error al reasignar usuario a SinRol:", error);
    throw error;
  } finally {
    connection.release();
  }
}