/**
 * @fileoverview Model for registering login errors in the database.
 * @version 1.0.1
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
  // Safe stringify helper: handles circular refs and truncates long output
  function safeStringify(obj, maxLen = 5000) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === "string") {
      return obj.length > maxLen ? obj.slice(0, maxLen) : obj;
    }

    const seen = new WeakSet();
    try {
      const str = JSON.stringify(obj, function (key, value) {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        if (typeof value === "string" && value.length > maxLen) {
          return value.slice(0, maxLen);
        }
        return value;
      });
      return str.length > maxLen ? str.slice(0, maxLen) : str;
    } catch (err) {
      try {
        const fallback = String(obj);
        return fallback.length > maxLen ? fallback.slice(0, maxLen) : fallback;
      } catch (_) {
        return null;
      }
    }
  }

  const detallesJson =
    detalles === null || detalles === undefined
      ? null
      : typeof detalles === "string"
      ? detalles.slice(0, 5000)
      : safeStringify(detalles, 5000);

  // Ensure `usuario` is not null to satisfy DB constraints that may be NOT NULL
  const finalUsuario = usuario === null || usuario === undefined ? "" : usuario;

  try {
    // Server-side short window dedupe: if an identical log was inserted
    // very recently, return its id instead of inserting a duplicate.
    // Match by usuario + codigoError + LEFT(mensajeError, 200) within last 5 seconds.
    try {
      const [existingRows] = await dbPool.query(
        `SELECT id FROM logsdeerroresdelogin
         WHERE usuario = ? AND codigoError = ? AND LEFT(mensajeError, 200) = ?
         AND createdAt >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
         ORDER BY id DESC LIMIT 1`,
        [finalUsuario, codigoError, (mensajeError || "").slice(0, 200)]
      );

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        // Return the existing id to indicate we didn't create a duplicate
        return existingRows[0].id;
      }
    } catch (preCheckErr) {
      // If the pre-check fails (e.g., table doesn't exist yet), ignore
      // and allow the normal insert logic (which will handle table creation).
    }

    const [result] = await dbPool.query(
      `INSERT INTO logsdeerroresdelogin
        (usuario, ipOrigen, agenteUsuario, codigoError, mensajeError, detalles)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        finalUsuario,
        ipOrigen,
        agenteUsuario,
        codigoError,
        mensajeError,
        detallesJson,
      ]
    );

    return result.insertId;
  } catch (err) {
    // If table doesn't exist (ER_NO_SUCH_TABLE), attempt to create it and retry once
    const isNoSuchTable =
      err &&
      (err.code === "ER_NO_SUCH_TABLE" ||
        err.errno === 1146 ||
        /doesn't exist/.test(err.message || ""));

    if (isNoSuchTable) {
      try {
        await dbPool.query(`
          CREATE TABLE IF NOT EXISTS logsdeerroresdelogin (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            usuario VARCHAR(255) NULL,
            ipOrigen VARCHAR(45) NULL,
            agenteUsuario VARCHAR(500) NULL,
            codigoError VARCHAR(50) NULL,
            mensajeError TEXT NOT NULL,
            detalles LONGTEXT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        const [retryResult] = await dbPool.query(
          `INSERT INTO logsdeerroresdelogin
            (usuario, ipOrigen, agenteUsuario, codigoError, mensajeError, detalles)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            finalUsuario,
            ipOrigen,
            agenteUsuario,
            codigoError,
            mensajeError,
            detallesJson,
          ]
        );

        return retryResult.insertId;
      } catch (createErr) {
        throw createErr;
      }
    }

    throw err;
  }
}
