import db from '../config/db.js';
import crypto from 'crypto';
import S3Service from '../services/s3Service.js';

class MembershipApplication {
  constructor(data) {
    this.nombres = data.nombres;
    this.apellidoP = data.apellidoP;
    this.apellidoM = data.apellidoM;
    this.telefono = data.telefono;
    this.email = data.email;
    this.pais = data.pais;
    this.estado = data.estado;
    this.ciudad = data.ciudad;
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

    const userId = crypto.randomUUID();

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
        `INSERT INTO Usuario 
        (IDUsuario, nombres, apellidoP, apellidoM, correo, telefono, pais, estado, ciudad, colonia, codigoPostal, licenciatura, cedula, titulo, constancias, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
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
          cedulaUrl,
          tituloUrl,
          constanciasUrl
        ]
      );

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