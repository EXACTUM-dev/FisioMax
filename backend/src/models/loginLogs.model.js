/**
 * @fileoverview Model for registering login errors in the database.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";

/**
 * Inserts a record into the `login_error_logs` table.
 *
 * @param {Object} params - Log data.
 * @param {string|null} params.usuario - User identifier (e.g., ClerkID or email).
 * @param {string|null} params.ipOrigen - Source IP address.
 * @param {string|null} params.agenteUsuario - Client User-Agent.
 * @param {string|null} params.codigoError - Error code or label.
 * @param {string} params.mensajeError - Main error message.
 * @param {Object|string|null} params.detalles - Additional information (serialized to JSON).
 * @returns {Promise<number>} ID of the inserted record.
 */
export async function insertLoginErrorLog({
  usuario = null,
  ipOrigen = null,
  agenteUsuario = null,
  codigoError = null,
  mensajeError,
  detalles = null,
}) {
  const detallesJson =
    detalles === null || detalles === undefined
      ? null
      : typeof detalles === "string"
      ? detalles
      : JSON.stringify(detalles);

  const [result] = await dbPool.query(
    `INSERT INTO logsdeerroresdelogin 
      (usuario, ipOrigen, agenteUsuario, codigoError, mensajeError, detalles)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario, ipOrigen, agenteUsuario, codigoError, mensajeError, detallesJson]
  );

  return result.insertId;
}

