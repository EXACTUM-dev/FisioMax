/**
 * @fileoverview Controlador para registrar logs de errores de login.
 * @version 1.0.0
 */

import { insertLoginErrorLog } from "../models/loginLogs.model.js";

function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

/**
 * Crea un nuevo registro de error de login.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function createLoginErrorLog(req, res) {
  try {
    const {
      usuario = null,
      ipOrigen = null,
      agenteUsuario = null,
      codigoError = null,
      mensajeError,
      detalles = null,
    } = req.body || {};

    if (!mensajeError) {
      return res
        .status(400)
        .json({ success: false, message: "mensajeError es obligatorio" });
    }

    const insertId = await insertLoginErrorLog({
      usuario,
      ipOrigen: ipOrigen || getRequestIp(req),
      agenteUsuario: agenteUsuario || req.headers["user-agent"] || null,
      codigoError,
      mensajeError,
      detalles,
    });

    return res.status(201).json({ success: true, id: insertId });
  } catch (error) {
    console.error("createLoginErrorLog error:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo registrar el log de login",
      detail: error?.message,
    });
  }
}

