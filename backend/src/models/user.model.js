/**
 * @fileoverview modelo de usuario.
 * @version 1.0.0
 * @author EXACTUM-dev
 * Modelo de usuario para MariaDB/MySQL.
 * Devuelve usuario y roles usando las tablas `Usuario`, `UsuarioRol`, `Rol`.
 */
import mysql from 'mysql2/promise';
import config from '../../config.js';


const connectionUri = config.database?.url || process.env.DATABASE_URL || process.env.DB_URL;
const pool = connectionUri
  ? mysql.createPool(connectionUri)
  : mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', user: process.env.DB_USER || 'root', database: process.env.DB_NAME || 'test', waitForConnections: true, connectionLimit: 10 });


/**
 * Busca un usuario por email (case-insensitive) usando la columna generated `normalized_email`.
 * Retorna objeto { id, nombres, apellidoP, apellidoM, correo, createdAt, primaryRole, roles: [] }
 */
export async function findByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const conn = await pool.getConnection();
  try {
    // Always use HMAC-based lookup by email_hash
    const crypto = await import('crypto');
    const KEY = process.env.EMAIL_HASH_KEY;
    if (!KEY) throw new Error('EMAIL_HASH_KEY no definida en el entorno');
    const hash = crypto.createHmac('sha256', KEY).update(normalized).digest('hex');
    const [users] = await conn.execute(
      `SELECT IDUsuario AS id, nombres, apellidoP, apellidoM, correo, createdAt, primaryRole
       FROM Usuario
       WHERE email_hash = ?
       LIMIT 1`,
      [hash]
    );
    if (!users || users.length === 0) return null;
    const user = users[0];

    const [rolesRows] = await conn.execute(
      `SELECT r.IDRol AS id, r.nombre AS name
       FROM UsuarioRol ur
       JOIN Rol r ON ur.IDRol = r.IDRol
       WHERE ur.IDUsuario = ?`,
      [user.id]
    );
    user.roles = rolesRows.map(r => ({ id: r.id, name: r.name }));
    if (!user.primaryRole) user.primaryRole = user.roles[0]?.name || null;
    return user;
  } finally {
    conn.release();
  }
}


export async function getRolesByEmail(email) {
  const u = await findByEmail(email);
  return u ? u.roles : [];
}


export default { findByEmail, getRolesByEmail };
