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
    if (!data.nombres || data.nombres.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!data.apellidoP || data.apellidoP.trim() === '') {
      throw new Error('El apellido paterno es obligatorio');
    }
    if (!data.telefonoWhatsApp || data.telefonoWhatsApp.trim() === '') {
      throw new Error('El teléfono (WhatsApp) es obligatorio');
    }
    if (!data.email || data.email.trim() === '') {
      throw new Error('El email es obligatorio');
    }
    if (!data.documentos?.cedula) {
      throw new Error('La cédula es obligatoria');
    }

    this.nombres = data.nombres.trim();
    this.apellidoP = data.apellidoP.trim();
    this.apellidoM = data.apellidoM?.trim() || null;
    this.telefonoCasa = data.telefonoCasa?.trim() || null;
    this.telefonoWhatsApp = data.telefonoWhatsApp.trim();
    this.email = data.email.trim();
    this.pais = data.pais?.trim() || null;
    this.estado = data.estado?.trim() || null;
    this.ciudad = data.ciudad?.trim() || null;
    this.calle = data.calle?.trim() || null;
    this.numExterior = data.numExterior?.trim() || null;
    this.numInterior = data.numInterior?.trim() || null;
    this.colonia = data.colonia?.trim() || null;
    this.codigoPostal = data.codigoPostal?.trim() || null;
    this.numeroExterior = data.numeroExterior?.trim() || null;
    this.numeroInterior = data.numeroInterior?.trim() || null;
    this.licenciatura = data.licenciatura?.trim() || null;
    this.instagram = data.instagram?.trim() || null;
    this.linkedin = data.linkedin?.trim() || null;
    this.facebook = data.facebook?.trim() || null;
    this.paginaWeb = data.paginaWeb?.trim() || null;
    this.documentos = data.documentos || {};
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

     
      const cedulaUrl = this.documentos.cedula || null;
      const tituloUrl = this.documentos.titulo || null;
      const constanciasUrl = this.documentos.constancias || null;

      await conn.query(
        `INSERT INTO Usuario 
        (IDUsuario, nombres, apellidoP, apellidoM, correo, telefonoCasa, telefonoWhatsApp, pais, estado, ciudad, colonia, codigoPostal, calle, numExterior, numInterior, licenciatura, instagram, linkedin, facebook, paginaWeb, cedula, titulo, constancias, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [ 
          userId, this.nombres, this.apellidoP, this.apellidoM, this.email, this.telefonoCasa, this.telefonoWhatsApp, this.pais, this.estado, this.ciudad, this.colonia, this.codigoPostal, this.calle, this.numeroExterior, 
          this.numeroInterior, this.licenciatura, this.instagram, this.linkedin, this.facebook, this.paginaWeb, cedulaUrl, tituloUrl, constanciasUrl
        ]
      );

      if (this.documentos.extra && this.documentos.extra.length > 0) {
        for (const extraDocUrl of this.documentos.extra) {
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