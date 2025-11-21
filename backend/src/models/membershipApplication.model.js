/**
 * @fileoverview Model to handle the membership information and modify the database
 * @version 2.3.0
 * @description Includes the creation of the application, save documents in S3,
 * insert new documents if necessary, and encryption/decryption of sensitive data.
 * @author EXACTUM-dev
 */

import S3Service from "../services/s3Service.js";
import db from "../../database/db.js";
import { encryptFields, decryptFields } from "../services/encryptionService.js";

/**
 * Sensitive fields that must be encrypted/decrypted.
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
 * Decrypts sensitive fields in a single application object.
 * @param {Object|null} application - Application object from database
 * @returns {Object|null} Application object with decrypted fields or null
 */
function decryptApplicationData(application) {
  if (!application) return null;
  return decryptFields(application, SENSITIVE_FIELDS);
}

/**
 * Decrypts sensitive fields in an array of applications.
 * @param {Array<Object>} applications - Array of application objects
 * @returns {Array<Object>} Array with decrypted fields
 */
function decryptApplicationsData(applications) {
  return applications.map(decryptApplicationData);
}

/**
 * Membership Application class.
 * Validates and stores membership application data with encryption.
 * @class
 */
class MembershipApplication {
  /**
   * Creates a MembershipApplication instance with validation.
   * @param {Object} data - Application data
   * @param {string} data.firstName - First name
   * @param {string} data.lastName - Paternal surname
   * @param {string} [data.middleName] - Maternal surname
   * @param {string} data.whatsappPhone - WhatsApp phone number
   * @param {string} data.email - Email address
   * @param {string} [data.professionalPhone] - Professional phone
   * @param {string} [data.birthDate] - Birth date
   * @param {string} [data.country] - Country
   * @param {string} [data.state] - State
   * @param {string} [data.city] - City
   * @param {string} [data.street] - Street
   * @param {string} [data.exteriorNumber] - Exterior number
   * @param {string} [data.interiorNumber] - Interior number
   * @param {string} [data.neighborhood] - Neighborhood
   * @param {string} [data.postalCode] - Postal code
   * @param {string} [data.degree] - Academic degree
   * @param {string} [data.instagram] - Instagram handle
   * @param {string} [data.linkedin] - LinkedIn handle
   * @param {string} [data.facebook] - Facebook handle
   * @param {string} [data.website] - Website URL
   * @param {Object} [data.documents] - Documents S3 keys
   * @throws {Error} When required fields are missing
   */
  constructor(data) {
    // Validation: nombres/firstName
    if (
      !(
        (data.nombres && String(data.nombres).trim() !== "") ||
        (data.firstName && String(data.firstName).trim() !== "")
      )
    ) {
      throw new Error("El nombre es obligatorio");
    }

    // Validation: apellidoP/lastName
    if (
      !(
        (data.apellidoP && String(data.apellidoP).trim() !== "") ||
        (data.lastName && String(data.lastName).trim() !== "")
      )
    ) {
      throw new Error("El apellido paterno es obligatorio");
    }

    // Validation: telefonoWhatsapp/whatsappPhone
    if (
      !(
        (data.telefonoWhatsapp &&
          String(data.telefonoWhatsapp).trim() !== "") ||
        (data.whatsappPhone && String(data.whatsappPhone).trim() !== "")
      )
    ) {
      throw new Error("El teléfono (WhatsApp) es obligatorio");
    }

    // Validation: correo/email
    if (
      !(
        (data.correo && String(data.correo).trim() !== "") ||
        (data.email && String(data.email).trim() !== "")
      )
    ) {
      throw new Error("El email es obligatorio");
    }

    // Store plain text values (will be encrypted on save)
    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.middleName = data.middleName?.trim() || null;
    this.professionalPhone = data.professionalPhone?.trim() || null;
    this.whatsappPhone = data.whatsappPhone.trim();
    this.email = data.email.trim();
    this.birthDate = data.birthDate?.trim() || null;
    this.country = data.country?.trim() || null;
    this.state = data.state?.trim() || null;
    this.city = data.city?.trim() || null;
    this.street = data.street?.trim() || null;
    this.exteriorNumber = data.exteriorNumber?.trim() || null;
    this.interiorNumber = data.interiorNumber?.trim() || null;
    this.neighborhood = data.neighborhood?.trim() || null;
    this.postalCode = data.postalCode?.trim() || null;
    this.degree = data.degree?.trim() || null;
    this.instagram = data.instagram?.trim() || null;
    this.linkedin = data.linkedin?.trim() || null;
    this.facebook = data.facebook?.trim() || null;
    this.website = data.website?.trim() || null;
    this.documents = data.documents || {};
    this.id = null;
  }

  /**
   * Saves the membership application to the database with encryption.
   * Creates both user and membership records in a transaction.
   * @async
   * @returns {Promise<MembershipApplication>} This instance with populated id and IDMembresia
   * @throws {Error} When database operation fails
   */
  async save() {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Prepare data for encryption with normalized email
      const dataToEncrypt = {
        nombres: this.firstName,
        apellidoP: this.lastName,
        apellidoM: this.middleName,
        correo: this.email ? this.email.toLowerCase().trim() : this.email,
        telefonoProfesional: this.professionalPhone,
        telefonoWhatsapp: this.whatsappPhone,
        colonia: this.neighborhood,
        calle: this.street,
        codigoPostal: this.postalCode,
      };

      // Encrypt sensitive fields
      const encryptedData = encryptFields(dataToEncrypt, SENSITIVE_FIELDS);

      // Extract document URLs
      const professionalIdUrl =
        this.documents.identificacionProfesional ||
        this.documents.cedula ||
        this.documents.professionalId ||
        null;
      const degreeDocumentUrl =
        this.documents.titulo || this.documents.degreeDocument || null;
      const certificatesUrl =
        this.documents.constancias || this.documents.certificates || null;
      // Check for existing user with same email that is not deleted
      const [existingUsers] = await conn.query(
        `SELECT * FROM usuario WHERE eliminado = 0`,
        [encryptedData.correo]
      );
      const decryptUsers = decryptApplicationsData(existingUsers);

      const existingEmail = decryptUsers.some(
        (users) => users.correo === dataToEncrypt.correo
      );

      if (existingEmail) {
        const duplicateError = new Error("Duplicate entry");
        duplicateError.code = "ER_DUP_ENTRY";
        throw duplicateError;
      }

      // Insert user with encrypted data
      const [userResult] = await conn.query(
        `INSERT INTO usuario 
        (nombres, apellidoP, apellidoM, correo, telefonoProfesional, telefonoWhatsapp, fechaNacimiento, pais, estado, ciudad, colonia, codigoPostal, calle, numExterior, numInterior, licenciatura, instagram, linkedin, facebook, paginaWeb, cedula, titulo, constancias, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [
          encryptedData.nombres,
          encryptedData.apellidoP,
          encryptedData.apellidoM,
          encryptedData.correo,
          encryptedData.telefonoProfesional,
          encryptedData.telefonoWhatsapp,
          this.birthDate,
          this.country,
          this.state,
          this.city,
          encryptedData.colonia,
          encryptedData.codigoPostal,
          encryptedData.calle,
          this.exteriorNumber,
          this.interiorNumber,
          this.degree,
          this.instagram,
          this.linkedin,
          this.facebook,
          this.website,
          professionalIdUrl,
          degreeDocumentUrl,
          certificatesUrl,
        ]
      );

      const userId = userResult.insertId;
      this.id = userId;

      if (!this.id) {
        throw new Error(
          "No se pudo determinar IDUsuario tras insertar Usuario"
        );
      }

      // Insert additional documents if present
      if (this.documents.extra && this.documents.extra.length > 0) {
        for (const extraDocUrl of this.documents.extra) {
          await conn.query(
            `INSERT INTO documentosadicionales 
            (IDUsuario, nombreArchivo, urlArchivo, createdAt) 
            VALUES (?, ?, ?, NOW())`,
            [userId, "Documento adicional", extraDocUrl]
          );
        }
      }

      // Create membership record
      const [mres] = await conn.query(
        `INSERT INTO membresia (IDUsuario, tipo, fechaVencimiento, constanciaPago, certificado, horasFormacion, aceptado, estatusPago, createdAt)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, NOW())`,
        [userId, "pendiente", "", "", 0, null, "pendiente"]
      );
      this.IDMembresia = mres?.insertId || null;

      await conn.commit();
      return this;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

/**
 * Obtains all the membership applications with user information.
 * Returns decrypted sensitive fields.
 * @async
 * @returns {Promise<Array<Object>>} Array of membership applications with user data (decrypted)
 * @throws {Error} When database query fails
 */
export const getMembershipApplications = async () => {
  const conn = await db.getConnection();
  try {
    const query = `
      SELECT m.IDMembresia, m.tipo, m.aceptado, m.estatusPago, u.IDUsuario, 
      u.nombres, u.apellidoP, u.correo, u.createdAt as createdAt
      FROM membresia m
      JOIN usuario u ON m.IDUsuario = u.IDUsuario
      WHERE m.deletedAt IS NULL AND u.eliminado = 0
    `;

    const [rows] = await conn.execute(query);
    return decryptApplicationsData(rows);
  } catch (error) {
    console.error("Error en getMembershipApplications:", error);
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Get full membership application detail by IDMembresia.
 * Decrypts sensitive user data before returning.
 * @async
 * @param {string|number} id - Membership ID
 * @returns {Promise<Object|null>} Detailed application object (decrypted) or null if not found
 * @returns {number} return.IDMembresia - Membership ID
 * @returns {string} return.tipo - Membership type
 * @returns {number|null} return.aceptado - Acceptance status
 * @returns {string} return.estatusPago - Payment status
 * @returns {number} return.IDUsuario - User ID
 * @returns {string} return.nombres - First name (decrypted)
 * @returns {string} return.apellidoP - Paternal surname (decrypted)
 * @returns {string|null} return.apellidoM - Maternal surname (decrypted)
 * @returns {string} return.nombreCompleto - Full name (decrypted)
 * @returns {string|null} return.ubicacion - Full address (decrypted)
 * @returns {string} return.correo - Email (decrypted)
 * @returns {Array<Object>} return.documentos - Documents with presigned URLs
 * @throws {Error} When database query or S3 operation fails
 */
export const getMembershipApplicationById = async (id) => {
  const conn = await db.getConnection();
  try {
    const query = `
      SELECT m.IDMembresia, m.tipo, m.aceptado, m.estatusPago, m.IDUsuario, u.*
      FROM membresia m
      JOIN usuario u ON m.IDUsuario = u.IDUsuario
      WHERE m.IDMembresia = ? AND m.deletedAt IS NULL
    `;

    const [rows] = await conn.execute(query, [id]);
    if (!rows || rows.length === 0) return null;

    // Decrypt sensitive fields
    const row = decryptApplicationData(rows[0]);
    const userId = row.IDUsuario;

    // Fetch additional documents
    const [additionalDocs] = await conn.execute(
      `SELECT * FROM documentosadicionales WHERE IDUsuario = ?`,
      [userId]
    );

    // Build documentos array including main document fields if present
    const documentos = [];

    // Helper to check if S3 key is valid
    const isPlaceholder = (k) => !k || String(k).startsWith("__missing_");

    // Add main documents with presigned URLs
    if (row.cedula && !isPlaceholder(row.cedula)) {
      const cedulaUrl = await S3Service.getPresignedUrl(row.cedula);
      documentos.push({
        id: "cedula",
        label: "Cédula profesional",
        url: cedulaUrl,
        key: row.cedula,
      });
    }
    if (row.titulo && !isPlaceholder(row.titulo)) {
      const tituloUrl = await S3Service.getPresignedUrl(row.titulo);
      documentos.push({
        id: "titulo",
        label: "Título",
        url: tituloUrl,
        key: row.titulo,
      });
    }
    if (row.constancias && !isPlaceholder(row.constancias)) {
      const constanciasUrl = await S3Service.getPresignedUrl(row.constancias);
      documentos.push({
        id: "constancias",
        label: "Constancias",
        url: constanciasUrl,
        key: row.constancias,
        hours: row.constanciaHoras,
      });
    }

    // Append additional documents
    for (const d of additionalDocs || []) {
      const docId =
        d.IDDocumentoAdicional || d.IDDocumento || d.id || d.ID || null;
      const label =
        d.nombreArchivo ||
        d.nombre ||
        d.nombre_archivo ||
        "Documento adicional";
      const hours = d.documentoHoras || null;
      const fileKey = d.urlArchivo || d.url || d.url_archivo || null;
      const url =
        fileKey && !isPlaceholder(fileKey)
          ? await S3Service.getPresignedUrl(fileKey)
          : null;
      documentos.push({ id: docId, label, url, key: fileKey, hours });
    }

    // Map address fields into a friendly string (already decrypted)
    const ubicacionParts = [];
    if (row.calle) ubicacionParts.push(row.calle);
    if (row.numExterior) ubicacionParts.push("No. " + row.numExterior);
    if (row.numInterior) ubicacionParts.push("Int. " + row.numInterior);
    if (row.colonia) ubicacionParts.push(row.colonia);
    if (row.codigoPostal) ubicacionParts.push(row.codigoPostal);
    if (row.ciudad) ubicacionParts.push(row.ciudad);
    if (row.estado) ubicacionParts.push(row.estado);
    if (row.pais) ubicacionParts.push(row.pais);

    const ubicacionStr = ubicacionParts.filter(Boolean).join(", ");

    const mapped = {
      IDMembresia: row.IDMembresia,
      tipo: row.tipo,
      aceptado: row.aceptado,
      estatusPago: row.estatusPago,
      IDUsuario: row.IDUsuario,
      nombres: row.nombres,
      apellidoP: row.apellidoP,
      apellidoM: row.apellidoM || null,
      nombreCompleto: `${row.nombres} ${row.apellidoP} ${
        row.apellidoM || ""
      }`.trim(),
      nombre: `${row.nombres} ${row.apellidoP} ${row.apellidoM || ""}`.trim(),
      ubicacion: ubicacionStr || null,
      correo: row.correo,
      telefonoProfesional: row.telefonoProfesional || null,
      telefonoWhatsapp: row.telefonoWhatsapp || null,
      calle: row.calle || null,
      numExterior: row.numExterior || null,
      numInterior: row.numInterior || null,
      colonia: row.colonia || null,
      codigoPostal: row.codigoPostal || null,
      ciudad: row.ciudad || null,
      estado: row.estado || null,
      pais: row.pais || null,
      licenciatura: row.licenciatura || null,
      paginaWeb: row.paginaWeb || null,
      facebook: row.facebook || null,
      instagram: row.instagram || null,
      linkedin: row.linkedin || null,
      documentos,
      __raw: row,
    };

    return mapped;
  } catch (error) {
    console.error("Error en getMembershipApplicationById:", error);
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Approve a membership application by IDMembresia.
 * @async
 * @param {number|string} id - Membership ID to approve
 * @returns {Promise<Object|null>} Updated application detail (decrypted) or null if not found
 * @throws {Error} When database operation fails
 */
export const approveMembershipApplicationById = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE membresia SET aceptado = 1 WHERE IDMembresia = ? AND deletedAt IS NULL`,
      [id]
    );

    await conn.commit();

    // Re-use existing getter to return the full mapped detail (decrypted)
    const detail = await getMembershipApplicationById(id);
    return detail;
  } catch (error) {
    await conn.rollback();
    console.error("Error approving membership application:", error);
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Deny a membership application with reason.
 * @async
 * @param {string} razonRechazo - Rejection reason
 * @param {number} id - Membership ID
 * @returns {Promise<Object|null>} Query result or null if not found
 * @throws {Error} When database operation fails
 */
export async function denyMembershipApplication(razonRechazo, id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const query = `
       UPDATE membresia 
      SET aceptado = 0, 
          motivoRechazo = ?
      WHERE IDMembresia = ? 
        AND deletedAt IS NULL
    `;

    const [result] = await conn.execute(query, [razonRechazo, id]);

    if (!result || result.affectedRows === 0) {
      await conn.rollback();
      return null;
    }

    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    console.error("Error en denyMembershipApplication:", error);
    throw error;
  } finally {
    conn.release();
  }
}

export default MembershipApplication;
