/**
 * @fileoverview Modelo de usuario para trabajar con correos hasheados en la columna `correo`.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import mysql from 'mysql2/promise';
import crypto from 'crypto';
import config from '../../config.js';

// Crear el pool de conexiones usando la configuración centralizada
const pool = mysql.createPool(config.db);

// Función para calcular el hash del correo
function hashEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return crypto.createHmac('sha256', process.env.EMAIL_HASH_KEY).update(normalizedEmail).digest('hex');
}

/**
 * Busca el correo y el rol principal de un usuario por el correo hasheado.
 * Retorna objeto { correo, roles: [{ id, name }] }
 */
export async function findByEmail(email) {
  if (!email) return null;
  const emailHash = hashEmail(email);
  const conn = await pool.getConnection();
  try {
    // Obtener correo del usuario
    const [users] = await conn.execute(
      'SELECT correo FROM Usuario WHERE correo = ? LIMIT 1',
      [emailHash]
    );
    if (!users || users.length === 0) return null;

    const user = users[0];

    // Obtener roles asociados al usuario
    const [rolesRows] = await conn.execute(
      `SELECT r.IDRol AS id, r.nombre AS name
       FROM UsuarioRol ur
       JOIN Rol r ON ur.IDRol = r.IDRol
       WHERE ur.IDUsuario = (
         SELECT IDUsuario FROM Usuario WHERE correo = ? LIMIT 1
       )`,
      [emailHash]
    );

    user.roles = rolesRows.map(r => ({ id: r.id, name: r.name }));
    return user;
  } finally {
    conn.release();
  }
}

/**
 * Obtiene roles por correo.
 * Retorna un arreglo de roles [{ id, name }]
 */
export async function getRolesByEmail(email) {
  const user = await findByEmail(email);
  return user ? user.roles : [];
}

export default { findByEmail, getRolesByEmail };