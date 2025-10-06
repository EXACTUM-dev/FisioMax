/**
 * @fileoverview Modelo de base de datos para solicitudes de membresía SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import mysql from 'mysql2/promise';
import config from '../config.js';

/**
 * Clase para manejar la conexión a la base de datos
 */
class DatabaseConnection {
  constructor() {
    this.pool = null;
  }

  /**
   * Crear pool de conexiones
   */
  createPool() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      });
    }
    return this.pool;
  }

  /**
   * Obtener conexión del pool
   */
  async getConnection() {
    if (!this.pool) {
      this.createPool();
    }
    return await this.pool.getConnection();
  }

  /**
   * Ejecutar query con parámetros
   */
  async query(sql, params = []) {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Cerrar pool de conexiones
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Instancia singleton
const db = new DatabaseConnection();

/**
 * Clase modelo para solicitudes de membresía con base de datos
 */
export class MembershipApplicationDB {
  constructor(data) {
    this.id = data.id;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.telefono = data.telefono;
    this.email = data.email;
    this.pais = data.pais;
    this.estado = data.estado;
    this.ciudad = data.ciudad;
    this.colonia = data.colonia;
    this.codigoPostal = data.codigo_postal;
    this.licenciatura = data.licenciatura;
    this.estadoSolicitud = data.estado_solicitud;
    this.fechaSolicitud = data.fecha_solicitud;
    this.fechaActualizacion = data.fecha_actualizacion;
    this.notas = data.notas;
    this.documentos = data.documentos || [];
  }

  /**
   * Crear nueva solicitud en la base de datos
   */
  static async create(applicationData) {
    const id = `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const sql = `
      INSERT INTO membership_applications (
        id, nombres, apellidos, telefono, email, pais, estado, ciudad, 
        colonia, codigo_postal, licenciatura, estado_solicitud, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      applicationData.nombres,
      applicationData.apellidos,
      applicationData.telefono || null,
      applicationData.email,
      applicationData.pais,
      applicationData.estado,
      applicationData.ciudad,
      applicationData.colonia || null,
      applicationData.codigoPostal || null,
      applicationData.licenciatura || null,
      'pendiente',
      applicationData.notas || null
    ];

    await db.query(sql, params);
    return id;
  }

  /**
   * Obtener solicitud por ID
   */
  static async findById(id) {
    const sql = `
      SELECT * FROM membership_applications 
      WHERE id = ?
    `;
    
    const rows = await db.query(sql, [id]);
    if (rows.length === 0) {
      return null;
    }

    const application = rows[0];
    
    // Obtener documentos asociados
    const documentsSql = `
      SELECT * FROM membership_documents 
      WHERE application_id = ?
    `;
    
    const documents = await db.query(documentsSql, [id]);
    application.documentos = documents;

    return new MembershipApplicationDB(application);
  }

  /**
   * Obtener todas las solicitudes con filtros y paginación
   */
  static async findAll(filters = {}, pagination = {}) {
    let sql = `
      SELECT * FROM membership_applications 
      WHERE 1=1
    `;
    const params = [];

    // Aplicar filtros
    if (filters.estado) {
      sql += ` AND estado_solicitud = ?`;
      params.push(filters.estado);
    }

    if (filters.email) {
      sql += ` AND email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    if (filters.fechaDesde) {
      sql += ` AND fecha_solicitud >= ?`;
      params.push(filters.fechaDesde);
    }

    if (filters.fechaHasta) {
      sql += ` AND fecha_solicitud <= ?`;
      params.push(filters.fechaHasta);
    }

    // Ordenar por fecha de solicitud descendente
    sql += ` ORDER BY fecha_solicitud DESC`;

    // Aplicar paginación
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
    
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await db.query(sql, params);
    
    // Obtener documentos para cada solicitud
    for (let application of rows) {
      const documentsSql = `
        SELECT * FROM membership_documents 
        WHERE application_id = ?
      `;
      const documents = await db.query(documentsSql, [application.id]);
      application.documentos = documents;
    }

    return rows.map(row => new MembershipApplicationDB(row));
  }

  /**
   * Contar total de solicitudes con filtros
   */
  static async count(filters = {}) {
    let sql = `SELECT COUNT(*) as total FROM membership_applications WHERE 1=1`;
    const params = [];

    if (filters.estado) {
      sql += ` AND estado_solicitud = ?`;
      params.push(filters.estado);
    }

    if (filters.email) {
      sql += ` AND email LIKE ?`;
      params.push(`%${filters.email}%`);
    }

    const rows = await db.query(sql, params);
    return rows[0].total;
  }

  /**
   * Actualizar estado de solicitud
   */
  static async updateStatus(id, newStatus, notas = '', changedBy = 'system') {
    // Obtener estado actual
    const currentApp = await this.findById(id);
    if (!currentApp) {
      throw new Error('Solicitud no encontrada');
    }

    const previousStatus = currentApp.estadoSolicitud;

    // Actualizar solicitud
    const updateSql = `
      UPDATE membership_applications 
      SET estado_solicitud = ?, notas = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(updateSql, [newStatus, notas, id]);

    // Registrar cambio en log
    const logSql = `
      INSERT INTO membership_status_logs 
      (application_id, previous_status, new_status, changed_by, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.query(logSql, [id, previousStatus, newStatus, changedBy, notas]);

    return await this.findById(id);
  }

  /**
   * Guardar documento en la base de datos
   */
  static async saveDocument(applicationId, documentData) {
    const sql = `
      INSERT INTO membership_documents 
      (application_id, document_type, original_name, file_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      applicationId,
      documentData.type,
      documentData.originalName,
      documentData.fileName,
      documentData.filePath,
      documentData.size,
      documentData.mimetype
    ];

    await db.query(sql, params);
  }

  /**
   * Obtener documento por tipo
   */
  static async getDocument(applicationId, documentType) {
    const sql = `
      SELECT * FROM membership_documents 
      WHERE application_id = ? AND document_type = ?
    `;
    
    const rows = await db.query(sql, [applicationId, documentType]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Eliminar solicitud y sus documentos
   */
  static async delete(id) {
    // Los documentos se eliminan automáticamente por CASCADE
    const sql = `DELETE FROM membership_applications WHERE id = ?`;
    await db.query(sql, [id]);
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async getStats() {
    const sql = `
      SELECT 
        estado_solicitud,
        COUNT(*) as total,
        DATE(fecha_solicitud) as fecha
      FROM membership_applications 
      GROUP BY estado_solicitud, DATE(fecha_solicitud)
      ORDER BY fecha DESC
    `;
    
    return await db.query(sql);
  }

  /**
   * Convertir a objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      pais: this.pais,
      estado: this.estado,
      ciudad: this.ciudad,
      colonia: this.colonia,
      codigoPostal: this.codigoPostal,
      licenciatura: this.licenciatura,
      estadoSolicitud: this.estadoSolicitud,
      fechaSolicitud: this.fechaSolicitud,
      fechaActualizacion: this.fechaActualizacion,
      notas: this.notas,
      documentos: this.documentos
    };
  }
}

export { db };
export default MembershipApplicationDB;
