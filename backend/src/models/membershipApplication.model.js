/**
 * @fileoverview Model to handle the membership information and modify the database
 * @version 2.0.0
 * @description Includes the creation of the application,
 * save documents in S3 and insert new documents if it's necessary
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
    if (!data.firstName || data.firstName.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!data.lastName || data.lastName.trim() === '') {
      throw new Error('El apellido paterno es obligatorio');
    }
    if (!data.whatsappPhone || data.whatsappPhone.trim() === '') {
      throw new Error('El teléfono (WhatsApp) es obligatorio');
    }
    if (!data.email || data.email.trim() === '') {
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

      const userId = crypto.randomUUID().replace(/-/g, '');

     
      const professionalIdUrl = this.documents.professionalId || null;
      const degreeDocumentUrl = this.documents.degreeDocument || null;
      const certificatesUrl = this.documents.certificates || null;

      await conn.query(
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

      if (this.documents.extra && this.documents.extra.length > 0) {
        for (const extraDocUrl of this.documents.extra) {
          await conn.query(
            `INSERT INTO DocumentosAdicionales 
            (IDUsuario, nombreArchivo, urlArchivo, createdAt) 
            VALUES (?, ?, ?, NOW())`,
            [userId, 'Documento adicional', extraDocUrl]
          );
        }
      }

      await conn.commit();
      this.id = userId;
      return this;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

export default MembershipApplication;