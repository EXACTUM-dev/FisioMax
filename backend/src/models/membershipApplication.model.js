/**
 * @fileoverview Model to handle the membership information and modify the database
 * @version 2.2.1
 * @description Includes the creation of the application,
 * save documents in S3 and insert new documents if it's necessary
 * Bring the membership applications from de DB
 */

import crypto from 'crypto';
import S3Service from '../services/s3Service.js';
import db from '../../database/db.js';

/**
 * Save the new membership application in database and documents in S3.
 * @param {object} data - Express all the data that will be save in data base.
 * @returns {Promise<void>} Sends JSON response with success or error.
 */
class MembershipApplication {
  constructor(data) {
    if (!((data.nombres && String(data.nombres).trim() !== '') || (data.firstName && String(data.firstName).trim() !== ''))) {
      throw new Error('El nombre es obligatorio');
    }
    if (!((data.apellidoP && String(data.apellidoP).trim() !== '') || (data.lastName && String(data.lastName).trim() !== ''))) {
      throw new Error('El apellido paterno es obligatorio');
    }
    if (!((data.telefonoWhatsApp && String(data.telefonoWhatsApp).trim() !== '') || (data.whatsappPhone && String(data.whatsappPhone).trim() !== '') || (data.telefonoWhatsApp && String(data.telefonoWhatsApp).trim() !== ''))) {
      throw new Error('El teléfono (WhatsApp) es obligatorio');
    }
    if (!((data.correo && String(data.correo).trim() !== '') || (data.email && String(data.email).trim() !== ''))) {
      throw new Error('El email es obligatorio');
    }

    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.middleName = data.middleName?.trim() || null;
    this.homePhone = data.homePhone?.trim() || null;
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
   * Save new application to the database and upload documents in S3
   * @returns {Promise<object>} - Message of success or fail
   */
  async save() {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();


      const professionalIdUrl = this.documents.identificacionProfesional || this.documents.cedula || this.documents.professionalId || null;
      const degreeDocumentUrl = this.documents.titulo || this.documents.degreeDocument || null;
      const certificatesUrl = this.documents.constancias || this.documents.certificates || null;

      const [userResult] = await conn.query(
        `INSERT INTO usuario 
        (nombres, apellidoP, apellidoM, correo, telefonoCasa, telefonoWhatsapp, fechaNacimiento, pais, estado, ciudad, colonia, codigoPostal, calle, numExterior, numInterior, licenciatura, instagram, linkedin, facebook, paginaWeb, cedula, titulo, constancias, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [ 
          this.firstName, 
          this.lastName, 
          this.middleName, 
          this.email, 
          this.homePhone,
          this.whatsappPhone,
          this.birthDate,
          this.country, 
          this.state, 
          this.city, 
          this.neighborhood, 
          this.postalCode, 
          this.street, 
          this.exteriorNumber, 
          this.interiorNumber, 
          this.degree, 
          this.instagram, 
          this.linkedin, 
          this.facebook, 
          this.website, 
          professionalIdUrl, 
          degreeDocumentUrl, 
          certificatesUrl
        ]
      );

      const userId = userResult.insertId;
      this.id = userId;

      if (!this.id) {
        throw new Error('No se pudo determinar IDUsuario tras insertar Usuario');
      }

      if (this.documents.extra && this.documents.extra.length > 0) {
        for (const extraDocUrl of this.documents.extra) {
          await conn.query(
            `INSERT INTO documentosadicionales 
            (IDUsuario, nombreArchivo, urlArchivo, createdAt) 
            VALUES (?, ?, ?, NOW())`,
            [userId, 'Documento adicional', extraDocUrl]
          );
        }
      }

      const [mres] = await conn.query(
        `INSERT INTO membresia (IDUsuario, tipo, fechaVencimiento, constanciaPago, certificado, horasFormacion, aceptado, estatusPago, createdAt)
         VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, NOW())`,
        [userId, 'pendiente', '', '', 0, null, 'pendiente']
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
 * Obtains all the membership applications with user information
 * @returns {Promise<Array>} Array that contains membership application with their user data
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
    return rows;
  } catch (error) {
    console.error("Error en getMembershipApplications:", error);
    throw error;
  } finally {
    conn.release();
  }
};


/**
 * Get full membership application detail by IDMembresia
 * @param {string|number} id
 * @returns {Promise<object|null>} detailed application or null if not found
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

    const row = rows[0];
    const userId = row.IDUsuario;

    // fetch all columns from DocumentosAdicionales and map them defensively
    const [additionalDocs] = await conn.execute(
      `SELECT * FROM documentosadicionales WHERE IDUsuario = ?`,
      [userId]
    );

    // Build documentos array including main document fields if present
    const documentos = [];

    // Only attempt to generate signed URLs for real S3 keys.
    const isPlaceholder = (k) => !k || String(k).startsWith('__missing_');

    if (row.cedula && !isPlaceholder(row.cedula)) {
      const cedulaUrl = await S3Service.getPresignedUrl(row.cedula);
      documentos.push({ id: 'cedula', label: 'Cédula profesional', url: cedulaUrl, key: row.cedula });
    }
    if (row.titulo && !isPlaceholder(row.titulo)) {
      const tituloUrl = await S3Service.getPresignedUrl(row.titulo);
      documentos.push({ id: 'titulo', label: 'Título', url: tituloUrl, key: row.titulo });
    }
    if (row.constancias && !isPlaceholder(row.constancias)) {
      const constanciasUrl = await S3Service.getPresignedUrl(row.constancias);
      documentos.push({ id: 'constancias', label: 'Constancias', url: constanciasUrl, key: row.constancias, hours: row.constanciaHoras});
    }

    // Append additional documents
    for (const d of additionalDocs || []) {
      const docId = d.IDDocumentoAdicional || d.IDDocumento || d.id || d.ID || null;
      const label = d.nombreArchivo || d.nombre || d.nombre_archivo || 'Documento adicional';
      const hours = d.documentoHoras || null;
      const fileKey = d.urlArchivo || d.url || d.url_archivo || null; // stored as S3 key
      const url = fileKey && !isPlaceholder(fileKey) ? await S3Service.getPresignedUrl(fileKey) : null;
      documentos.push({ id: docId, label, url, key: fileKey, hours});
    }

    // Map address / contact fields into a friendly shape
    const ubicacionParts = [];
    if (row.calle) ubicacionParts.push(row.calle);
    if (row.numExterior) ubicacionParts.push('No. ' + (row.numExterior));
    if (row.numInterior) ubicacionParts.push('Int. ' + (row.numInterior));
    if (row.colonia) ubicacionParts.push(row.colonia);
    if (row.codigoPostal) ubicacionParts.push(row.codigoPostal);
    if (row.ciudad) ubicacionParts.push(row.ciudad);
    if (row.estado) ubicacionParts.push(row.estado);
    if (row.pais) ubicacionParts.push(row.pais);

    const ubicacionStr = ubicacionParts.filter(Boolean).join(', ');

    const mapped = {
      IDMembresia: row.IDMembresia,
      tipo: row.tipo,
      aceptado: row.aceptado,
      estatusPago: row.estatusPago,
      IDUsuario: row.IDUsuario,
      nombres: row.nombres,
      apellidoP: row.apellidoP,
      apellidoM: row.apellidoM || null,
      nombreCompleto: `${row.nombres} ${row.apellidoP} ${row.apellidoM || ''}`.trim(),
      nombre: `${row.nombres} ${row.apellidoP} ${row.apellidoM || ''}`.trim(),
      ubicacion: ubicacionStr || null,
      correo: row.correo,
      telefonoCasa: row.telefonoCasa || null,
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
    console.error('Error en getMembershipApplicationById:', error);
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Approve a membership application by IDMembresia and return the updated application detail.
 * @param {number|string} id
 * @returns {Promise<object|null>}
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

    // Re-use existing getter to return the full mapped detail
    const detail = await getMembershipApplicationById(id);
    return detail;
  } catch (error) {
    await conn.rollback();
    console.error('Error approving membership application:', error);
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Deny a membership application with reason
 * @param {number} id - Membership ID
 * @returns {Promise} Query's answer
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
    console.error('Error en denyMembershipApplication:', error);
    throw error;
  } finally {
    conn.release();
  }
}







export default MembershipApplication;