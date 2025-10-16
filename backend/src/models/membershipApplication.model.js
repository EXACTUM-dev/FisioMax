/**
 * version 2.0.0
 * Model to handle the membership information and modify the database
 * Includes the creation of the application, save documents in S3 and insert new documents if it's necessary
 */

import crypto from 'crypto';
import S3Service from '../services/s3Service.js';
import db from '../../database/db.js';


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
    if (!data.documents?.professionalId) {
      throw new Error('La cédula es obligatoria');
    }

    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.middleName = data.middleName?.trim() || null;
    this.homePhone = data.homePhone?.trim() || null;
    this.whatsappPhone = data.whatsappPhone.trim();
    this.email = data.email.trim();
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
        `INSERT INTO Usuario 
        (IDUsuario, firstName, lastName, middleName, email, homePhone, telefonoWhatsApp, country, state, city, neighborhood, postalCode, street, exteriorNumber, interiorNumber, degree, instagram, linkedin, facebook, website, professionalId, degreeDocument, certificates, createdAt, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [ 
          userId, this.firstName, this.lastName, this.middleName, this.email, this.homePhone, this.whatsappPhone, this.country, this.state, this.city, this.neighborhood, this.postalCode, this.street, this.exteriorNumber, 
          this.interiorNumber, this.degree, this.instagram, this.linkedin, this.facebook, this.website, professionalIdUrl, degreeDocumentUrl, certificatesUrl
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