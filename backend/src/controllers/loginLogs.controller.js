/**
 * @fileoverview Controller for registering login error logs.
 * @version 1.0.1
 * @author EXACTUM-dev
 *
 * @description Input data has been validated and sanitized by the
 * validateLoginErrorLog middleware before reaching this controller.
 * Only business logic is performed here.
 */

import { insertLoginErrorLog } from "../models/loginLogs.model.js";
import { getRequestIp } from "../utils/request.js";

/**
 * Creates a new login error log entry.
 *
 * Input data has already been validated and sanitized by the
 * validateLoginErrorLog middleware. Only business logic is performed here.
 *
 * @param {import("express").Request} req - Express request object with sanitized body
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If database insertion fails
 */
export async function createLoginErrorLog(req, res) {
  try {
    // Data is already validated and sanitized by middleware
    const {
      usuario = null,
      ipOrigen = null,
      agenteUsuario = null,
      codigoError = null,
      mensajeError,
      detalles = null,
    } = req.body;

    // Use request IP if not provided in body
    const finalIpOrigen = ipOrigen || getRequestIp(req);
    // Use User-Agent from header if not provided in body
    const finalAgenteUsuario = agenteUsuario || req.headers["user-agent"] || null;

    const insertId = await insertLoginErrorLog({
      usuario,
      ipOrigen: finalIpOrigen,
      agenteUsuario: finalAgenteUsuario,
      codigoError,
      mensajeError,
      detalles,
    });

    return res.status(201).json({ success: true, id: insertId });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register login log",
      detail: error?.message,
    });
  }
}

