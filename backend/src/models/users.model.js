/**
 * @fileoverview User model - Database interaction for users with encryption support.
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Handles all user-related database operations including encryption/decryption
 * of sensitive fields (nombres, apellidoP, apellidoM, correo, telefonos, colonia, calle, codigoPostal).
 */

import { dbPool } from "../../config.js";
import { findRoleByName } from "./roles.model.js";
import {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
} from "../services/encryptionService.js";

/**
 * Sensitive fields that must be encrypted/decrypted.
 * These fields are encrypted when saving to DB and decrypted when reading.
 * @constant {Array<string>}
 */
const SENSITIVE_FIELDS = [
  "nombres",
  "apellidoP",
  "apellidoM",
  "correo",
  "telefonoProfesional",
  "telefonoWhatsapp",
  "colonia",
  "calle",
  "codigoPostal",
];

/**
 * Decrypts sensitive fields in a single user object.
 * @param {Object|null} user - User object from database
 * @returns {Object|null} User object with decrypted fields or null if input is null
 */
function decryptUserData(user) {
  if (!user) return null;
  return decryptFields(user, SENSITIVE_FIELDS);
}

/**
 * Decrypts sensitive fields in an array of user objects.
 * @param {Array<Object>} users - Array of user objects from database
 * @returns {Array<Object>} Array of user objects with decrypted fields
 */
function decryptUsersData(users) {
  return users.map(decryptUserData);
}

/**
 * Get all users with their assigned roles from the database.
 * Performs a LEFT JOIN with usuariorol and rol tables to include role information.
 * Only returns users with accepted memberships.
 * @async
 * @returns {Promise<Array<Object>>} Array of user objects with role information and decrypted sensitive data
 * @throws {Error} When database query fails
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
        u.telefonoProfesional,
        u.telefonoWhatsapp,
        u.fechaNacimiento,
        r.IDRol,
        r.nombre as rolNombre,
        r.descripcion as rolDescripcion,
        m.estatusPago as membresiaEstatusPago,
        m.aceptado as membresiaAceptado
      FROM usuario u
      INNER JOIN membresia m ON u.IDUsuario = m.IDUsuario
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
    return decryptUsersData(rows);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    throw error;
  }
}

/**
 * Retrieves the membership status ("aceptado") of a specific user.
 * @async
 * @param {number|string} userId - The unique identifier of the user
 * @returns {Promise<Object|null>} Object with aceptado status and motivoRechazo, or null if not found
 * @returns {number} return.aceptado - 1 if accepted, 0 if denied, null if pending
 * @returns {string|null} return.motivoRechazo - Rejection reason if denied
 * @throws {Error} When database query fails
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
    throw error;
  }
}

/**
 * Get a single user by Clerk ID with all their information including documents.
 * Decrypts all sensitive fields before returning.
 * @async
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<Object|null>} User object with all data (decrypted) or null if not found
 * @returns {number} return.IDUsuario - Database user ID
 * @returns {string} return.clerkID - Clerk user ID
 * @returns {string} return.nombres - First name (decrypted)
 * @returns {string} return.apellidoP - Paternal surname (decrypted)
 * @returns {string|null} return.apellidoM - Maternal surname (decrypted)
 * @returns {string} return.correo - Email (decrypted)
 * @returns {string|null} return.telefonoProfesional - Professional phone (decrypted)
 * @returns {string|null} return.telefonoWhatsapp - WhatsApp phone (decrypted)
 * @returns {Array<Object>} return.documentosadicionales - Additional documents array
 * @throws {Error} When database query fails
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
        u.telefonoProfesional,
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

    const user = decryptUserData(rows[0]);

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
      console.warn(
        "documentosadicionales table not found or error:",
        docError.message
      );
      user.documentosadicionales = [];
    }

    return user;
  } catch (error) {
    console.error("Error al obtener usuario por Clerk ID:", error);
    throw error;
  }
}

/**
 * Alias for getUserByClerkId for backward compatibility.
 * @see getUserByClerkId
 */
export const getUsuarioByClerkId = getUserByClerkId;

/**
 * Get a user by their database ID (IDUsuario).
 * Returns decrypted sensitive fields.
 * @async
 * @param {string|number} userId - The database user ID
 * @returns {Promise<Object|null>} User object with role and membership information (decrypted) or null if not found
 * @throws {Error} When database query fails
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
        u.telefonoProfesional,
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
    return rows.length > 0 ? decryptUserData(rows[0]) : null;
  } catch (error) {
    console.error("Error al consultar usuario por ID:", error);
    throw error;
  }
}

/**
 * Get a user by their email address.
 * Email is encrypted for search, then decrypted in results.
 * @async
 * @param {string} email - The user's email address (plain text)
 * @returns {Promise<Object|null>} User object with role information (decrypted) or null if not found
 * @throws {Error} When database query fails
 */
export async function getUserByEmail(email) {
  try {
    // Normalize email before encrypting (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Encrypt normalized email for search
    const encryptedEmail = encrypt(normalizedEmail);

    const [rows] = await dbPool.query(
      `SELECT 
        u.IDUsuario,
        u.clerkID,
        u.nombres, 
        u.apellidoP, 
        u.apellidoM,
        u.foto,
        u.correo,
        u.telefonoProfesional,
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
      ORDER BY u.IDUsuario DESC
      LIMIT 1`,
      [encryptedEmail]
    );

    // If not found with encrypted search, try decrypting all and searching
    if (rows.length === 0) {
      const [allRows] = await dbPool.query(
        `SELECT 
          u.IDUsuario,
          u.clerkID,
          u.nombres, 
          u.apellidoP, 
          u.apellidoM,
          u.foto,
          u.correo,
          u.telefonoProfesional,
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
        WHERE u.deletedAt IS NULL 
          AND u.eliminado = 0
        ORDER BY u.IDUsuario DESC`
      );

      // Decrypt and search
      for (const row of allRows) {
        const decryptedUser = decryptUserData(row);
        if (
          decryptedUser &&
          decryptedUser.correo &&
          decryptedUser.correo.toLowerCase().trim() === normalizedEmail
        ) {
          return decryptedUser;
        }
      }

      return null;
    }

    return rows.length > 0 ? decryptUserData(rows[0]) : null;
  } catch (error) {
    console.error("Error al consultar usuario por email:", error);
    throw error;
  }
}

/**
 * Update a user's Clerk ID.
 * @async
 * @param {string|number} userId - The database user ID
 * @param {string} clerkID - The Clerk user ID to associate
 * @returns {Promise<boolean>} True if updated successfully
 * @throws {Error} When database query fails
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
 * Update fields of a user by ID.
 * Only updates the fields provided in updateData.
 * Automatically encrypts sensitive fields before saving.
 * @async
 * @param {string|number} userId - User ID to update
 * @param {Object} updateData - Object with fields to update (plain text values)
 * @param {string} [updateData.nombres] - First name
 * @param {string} [updateData.apellidoP] - Paternal surname
 * @param {string} [updateData.apellidoM] - Maternal surname
 * @param {string} [updateData.correo] - Email
 * @param {string} [updateData.telefonoProfesional] - Professional phone
 * @param {string} [updateData.telefonoWhatsapp] - WhatsApp phone
 * @param {string} [updateData.fechaNacimiento] - Birth date
 * @param {string} [updateData.licenciatura] - Degree
 * @param {string} [updateData.pais] - Country
 * @param {string} [updateData.estado] - State
 * @param {string} [updateData.ciudad] - City
 * @param {string} [updateData.calle] - Street
 * @param {string} [updateData.numExterior] - Exterior number
 * @param {string} [updateData.numInterior] - Interior number
 * @param {string} [updateData.colonia] - Neighborhood
 * @param {string} [updateData.codigoPostal] - Postal code
 * @param {string} [updateData.instagram] - Instagram handle
 * @param {string} [updateData.linkedin] - LinkedIn handle
 * @param {string} [updateData.facebook] - Facebook handle
 * @param {string} [updateData.paginaWeb] - Website URL
 * @param {string} [updateData.titulo] - Degree document S3 key
 * @param {string} [updateData.cedula] - Professional ID S3 key
 * @param {string} [updateData.constancias] - Certificates S3 key
 * @param {string} [updateData.membershipType] - Membership type
 * @param {string} [updateData.membershipRegisteredAt] - Membership registration date
 * @param {string} [updateData.membershipExpiresAt] - Membership expiration date
 * @param {string} [updateData.membershipPaymentStatus] - Payment status
 * @returns {Promise<Object|null>} Updated user object (with decrypted fields) or null if not found
 * @throws {Error} When userId is missing or database operation fails
 */
export async function updateUserById(userId, updateData) {
  const connection = await dbPool.getConnection();
  try {
    if (!userId) {
      throw new Error("ID de usuario requerido");
    }

    await connection.beginTransaction();

    // Allowed fields for usuario table
    const userAllowedFields = [
      "nombres",
      "apellidoP",
      "apellidoM",
      "correo",
      "telefonoProfesional",
      "telefonoWhatsapp",
      "fechaNacimiento",
      "licenciatura",
      "pais",
      "estado",
      "ciudad",
      "calle",
      "numExterior",
      "numInterior",
      "colonia",
      "codigoPostal",
      "instagram",
      "linkedin",
      "facebook",
      "paginaWeb",
      "titulo",
      "cedula",
      "constancias",
    ];

    // Allowed fields for membresia table
    const membershipAllowedFields = [
      "membershipType",
      "membershipRegisteredAt",
      "membershipExpiresAt",
      "membershipPaymentStatus",
    ];

    // Normalize email if present
    const normalizedUpdateData = {
      ...updateData,
      ...(updateData.correo && {
        correo: updateData.correo.toLowerCase().trim(),
      }),
    };

    // Encrypt sensitive fields before update
    const encryptedData = encryptFields(normalizedUpdateData, SENSITIVE_FIELDS);

    const userSetClauses = [];
    const userValues = [];

    // Build SET clauses for usuario table
    for (const field of userAllowedFields) {
      if (Object.prototype.hasOwnProperty.call(normalizedUpdateData, field)) {
        userSetClauses.push(`${field} = ?`);
        // Use encrypted value if field is sensitive, otherwise use original
        const valueToUse =
          SENSITIVE_FIELDS.includes(field) && encryptedData[field]
            ? encryptedData[field]
            : normalizedUpdateData[field];
        userValues.push(valueToUse);
      }
    }

    // Update usuario table if there are fields to update
    if (userSetClauses.length > 0) {
      const userSql = `UPDATE usuario SET ${userSetClauses.join(
        ", "
      )} WHERE IDUsuario = ? AND deletedAt IS NULL AND eliminado = 0`;
      userValues.push(userId);
      await connection.query(userSql, userValues);
    }

    // Build SET clauses for membresia table
    const membershipSetClauses = [];
    const membershipValues = [];

    for (const field of membershipAllowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        let dbField = field;
        if (field === "membershipType") dbField = "tipo";
        else if (field === "membershipRegisteredAt") dbField = "createdAt";
        else if (field === "membershipExpiresAt") dbField = "fechaVencimiento";
        else if (field === "membershipPaymentStatus") dbField = "estatusPago";

        membershipSetClauses.push(`${dbField} = ?`);
        membershipValues.push(updateData[field]);
      }
    }

    // Update membresia table if there are fields to update
    if (membershipSetClauses.length > 0) {
      const membershipSql = `UPDATE membresia SET ${membershipSetClauses.join(
        ", "
      )} WHERE IDUsuario = ? AND deletedAt IS NULL`;
      membershipValues.push(userId);
      const [result] = await connection.query(membershipSql, membershipValues);

      // If no membership exists, log a warning but don't fail
      if (result.affectedRows === 0) {
        console.warn(`No se encontró membresía para el usuario ${userId}`);
      }
    }

    await connection.commit();

    // Return updated user data (decrypted)
    const updatedUser = await getUserById(userId);
    return updatedUser;
  } catch (error) {
    await connection.rollback();
    console.error("Error actualizando usuario:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Create a new user with Clerk ID (for automatic sync from Clerk webhook).
 * Automatically encrypts sensitive fields before insertion.
 * @async
 * @param {Object} userData - User data from Clerk (plain text)
 * @param {string} userData.clerkID - Clerk user ID
 * @param {number} userData.IDUsuario - Database user ID
 * @param {string} userData.nombres - First name
 * @param {string} userData.apellidoP - Paternal surname
 * @param {string} [userData.apellidoM] - Maternal surname
 * @param {string} userData.correo - Email address
 * @param {string} [userData.telefonoProfesional] - Professional phone
 * @param {string} [userData.telefonoWhatsapp] - WhatsApp phone
 * @param {string} [userData.fechaNacimiento] - Birth date
 * @param {string} [userData.foto] - Profile photo URL
 * @param {string} [userData.pais] - Country
 * @param {string} [userData.estado] - State
 * @param {string} [userData.ciudad] - City
 * @param {string} [userData.colonia] - Neighborhood
 * @param {string} [userData.codigoPostal] - Postal code
 * @returns {Promise<Object>} Created user object (with decrypted fields)
 * @throws {Error} When user creation fails or rollback occurs
 */
export async function createUserWithClerkId(userData) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      clerkID,
      IDUsuario,
      nombres,
      apellidoP,
      apellidoM = null,
      correo,
      telefonoProfesional = "",
      telefonoWhatsapp = "",
      fechaNacimiento = "",
      foto = null,
      pais = "México",
      estado = "",
      ciudad = null,
      colonia = null,
      codigoPostal = null,
    } = userData;

    // Normalize email before encryption
    const normalizedUserData = {
      ...userData,
      correo: correo ? correo.toLowerCase().trim() : correo,
    };

    // Encrypt sensitive data before insertion
    const encryptedData = encryptFields(normalizedUserData, SENSITIVE_FIELDS);

    const [result] = await connection.query(
      `INSERT INTO usuario 
        (IDUsuario, clerkID, nombres, apellidoP, apellidoM, correo, telefonoProfesional, telefonoWhatsapp, fechaNacimiento, foto, pais, estado, ciudad, colonia, codigoPostal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        IDUsuario,
        clerkID,
        encryptedData.nombres,
        encryptedData.apellidoP,
        encryptedData.apellidoM,
        encryptedData.correo,
        encryptedData.telefonoProfesional,
        encryptedData.telefonoWhatsapp,
        fechaNacimiento,
        foto,
        pais,
        estado,
        ciudad,
        encryptedData.colonia,
        encryptedData.codigoPostal,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("No se pudo crear el usuario");
    }

    // Assign "SinRol" role if it exists
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

    // Return created user (with decrypted fields)
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
 * @async
 * @param {number|string} userId - The ID of the user to delete
 * @returns {Promise<number>} Number of affected rows (1 if successful, 0 if user not found)
 * @throws {Error} When database query fails
 */
export async function markUserDeleted(userId) {
  const [r] = await dbPool.query(
    `UPDATE usuario
        SET eliminado = 1, deletedAt = NOW()
      WHERE IDUsuario = ?
        AND deletedAt IS NULL
        AND (eliminado = 0 OR eliminado IS NULL)`,
    [userId]
  );
  return r.affectedRows;
}

/**
 * Reassign a user's role to "SinRol" if it exists.
 * If "SinRol" doesn't exist, just marks the user role as deleted.
 * @async
 * @param {string|number} userId - User ID to reassign
 * @returns {Promise<boolean>} True if reassigned successfully or role marked as deleted
 * @throws {Error} When database operation fails or rollback occurs
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
      console.warn(
        'Rol "SinRol" no encontrado. Marcando rol de usuario como eliminado.'
      );
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
