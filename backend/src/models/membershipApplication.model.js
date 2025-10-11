import crypto from 'crypto';
import S3Service from '../services/s3Service.js';
import db from '../../database/db.js';

class MembershipApplication {
  constructor(data) {
    // Validar campos obligatorios
    if (!data.nombres || data.nombres.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!data.apellidoP || data.apellidoP.trim() === '') {
      throw new Error('El apellido paterno es obligatorio');
    }
    if (!data.apellidoM || data.apellidoM.trim() === '') {
      throw new Error('El apellido materno es obligatorio');
    }
    if (!data.telefono || data.telefono.trim() === '') {
      throw new Error('El teléfono es obligatorio');
    }
    if (!data.email || data.email.trim() === '') {
      throw new Error('El email es obligatorio');
    }
    if (!data.documentos?.cedula) {
      throw new Error('La cédula es obligatoria');
    }

    this.nombres = data.nombres.trim();
    this.apellidoP = data.apellidoP.trim();
    this.apellidoM = data.apellidoM.trim();
    this.telefono = data.telefono.trim();
    this.email = data.email.trim();
    this.pais = data.pais;
    this.estado = data.estado;
    this.ciudad = data.ciudad;
    this.calle = data.calle || null;
    this.numExterior = data.numExterior || null;
    this.numInterior = data.numInterior || null;
    this.colonia = data.colonia || null;
    this.codigoPostal = data.codigoPostal || null;
    this.licenciatura = data.licenciatura || null;
    this.documentos = data.documentos || {};
    this.id = null;
  }

  // Guardar solicitud
  async save() {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const userId = crypto.randomUUID().replace(/-/g, '');

      // Subir archivos a S3
      const cedulaUrl = this.documentos.cedula
        ? await S3Service.uploadFile(this.documentos.cedula, 'uploads/documents')
        : null;

      const tituloUrl = this.documentos.titulo
        ? await S3Service.uploadFile(this.documentos.titulo, 'uploads/documents')
        : null;

      const constanciasUrl = this.documentos.constancias
        ? await S3Service.uploadFile(this.documentos.constancias, 'uploads/documents')
        : null;

      // Guardar información
      await conn.query(
        `INSERT INTO usuario 
        (IDUsuario, nombres, apellidoP, apellidoM, correo, telefono, pais, estado, ciudad, colonia, codigoPostal, licenciatura, calle, numexterior, numinterior, cedula, titulo, constancias, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [
          userId,
          this.nombres,
          this.apellidoP,
          this.apellidoM,
          this.email,
          this.telefono,
          this.pais,
          this.estado,
          this.ciudad,
          this.colonia,
          this.codigoPostal,
          this.licenciatura,
          this.calle,
          this.numExterior,
          this.numInterior,
          cedulaUrl,
          tituloUrl,
          constanciasUrl
        ]
      );

      // Subir y guardar documentos adicionales
      if (this.documentos.extra && this.documentos.extra.length > 0) {
        for (const extraDoc of this.documentos.extra) {
          const extraDocUrl = await S3Service.uploadFile(extraDoc, 'uploads/documents');
          
          // Guardar URL del documento adicional en tabla separada
          await conn.query(
            `INSERT INTO DocumentosAdicionales 
            (IDUsuario, nombreArchivo, urlArchivo, createdAt) 
            VALUES (?, ?, ?, NOW())`,
            [userId, extraDoc.originalname, extraDocUrl]
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