/**
 * @fileoverview Modelo para registrar errores de login en la base de datos.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { dbPool } from "../../config.js";

/**
 * Inserta un registro en la tabla `login_error_logs`.
 *
 * @param {Object} params - Datos del log.
 * @param {string|null} params.usuario - Identificador del usuario (por ejemplo ClerkID o email).
 * @param {string|null} params.ipOrigen - Dirección IP de origen.
 * @param {string|null} params.agenteUsuario - User-Agent del cliente.
 * @param {string|null} params.codigoError - Código o etiqueta del error.
 * @param {string} params.mensajeError - Mensaje principal del error.
 * @param {Object|string|null} params.detalles - Información adicional (se serializa a JSON).
 * @returns {Promise<number>} ID del registro insertado.
 */
export async function insertLoginErrorLog({
  usuario = null,
  ipOrigen = null,
  agenteUsuario = null,
  codigoError = null,
  mensajeError,
  detalles = null,
}) {
  if (!mensajeError) {
    throw new Error("mensajeError es obligatorio para registrar un log de login");
  }

  const detallesJson =
    detalles === null || detalles === undefined
      ? null
      : typeof detalles === "string"
      ? detalles
      : JSON.stringify(detalles);

  const [result] = await dbPool.query(
    `INSERT INTO login_error_logs 
      (usuario, ip_origen, agente_usuario, codigo_error, mensaje_error, detalles)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario, ipOrigen, agenteUsuario, codigoError, mensajeError, detallesJson]
  );

  return result.insertId;
}

