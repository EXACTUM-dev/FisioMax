import db from '../config/db.js';
import crypto from 'crypto';

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

  async save() {
    const conn = await db.getConnection();
    try {
      const userId = crypto.randomUUID();

      await conn.query(
        `INSERT INTO Usuario 
        (IDUsuario, nombres, apellidoP, apellidoM, correo, telefono, pais, estado, ciudad, colonia, codigoPostal, licenciatura, createdAt, eliminado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
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
          this.licenciatura
        ]
      );

      this.id = userId;
      return this;
    } finally {
      conn.release();
    }
  }
}

export default MembershipApplication;