/**
 * @fileoverview Validation middleware for the login-errors endpoint.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { sanitizeString, validateStringLength } from "../utils/sanitization.js";

/**
 * Validation limits for login error log fields.
 * @type {Object}
 * @constant
 * @property {number} usuario - Maximum length for usuario field (255 characters)
 * @property {number} ipOrigen - Maximum length for ipOrigen field (45 characters, IPv6 max)
 * @property {number} agenteUsuario - Maximum length for agenteUsuario field (500 characters)
 * @property {number} codigoError - Maximum length for codigoError field (50 characters)
 * @property {number} mensajeError - Maximum length for mensajeError field (1000 characters)
 * @property {number} detallesMaxSize - Maximum size for detalles field when string/JSON (5000 characters)
 */
const VALIDATION_LIMITS = {
  usuario: 255,
  ipOrigen: 45, // IPv6 maximum
  agenteUsuario: 500,
  codigoError: 50,
  mensajeError: 1000,
  detallesMaxSize: 5000, // Maximum size for detalles when string/JSON
};

/**
 * Validates and sanitizes the usuario field.
 * @param {*} value - Value to validate
 * @returns {string|null} Sanitized value or null
 * @throws {Error} If value is not a string when provided
 */
function validateUsuario(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("usuario must be a string");
  }
  const sanitized = sanitizeString(value);
  validateStringLength(sanitized, VALIDATION_LIMITS.usuario, "usuario");
  return sanitized || null;
}

/**
 * Validates and sanitizes the ipOrigen field.
 * Validates IP address format (IPv4 or IPv6).
 * @param {*} value - Value to validate
 * @returns {string|null} Sanitized value or null
 * @throws {Error} If value is not a string or is not a valid IP address
 */
function validateIpOrigen(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("ipOrigen must be a string");
  }
  const sanitized = sanitizeString(value.trim());
  // Validate basic IP format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (sanitized && !ipRegex.test(sanitized)) {
    throw new Error("ipOrigen must be a valid IP address");
  }
  validateStringLength(sanitized, VALIDATION_LIMITS.ipOrigen, "ipOrigen");
  return sanitized || null;
}

/**
 * Validates and sanitizes the agenteUsuario field.
 * @param {*} value - Value to validate
 * @returns {string|null} Sanitized value or null
 * @throws {Error} If value is not a string when provided
 */
function validateAgenteUsuario(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("agenteUsuario must be a string");
  }
  const sanitized = sanitizeString(value);
  validateStringLength(sanitized, VALIDATION_LIMITS.agenteUsuario, "agenteUsuario");
  return sanitized || null;
}

/**
 * Validates and sanitizes the codigoError field.
 * @param {*} value - Value to validate
 * @returns {string|null} Sanitized value or null
 * @throws {Error} If value is not a string when provided
 */
function validateCodigoError(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("codigoError must be a string");
  }
  const sanitized = sanitizeString(value);
  validateStringLength(sanitized, VALIDATION_LIMITS.codigoError, "codigoError");
  return sanitized || null;
}

/**
 * Validates and sanitizes the mensajeError field (required).
 * @param {*} value - Value to validate
 * @returns {string} Sanitized value
 * @throws {Error} If value is missing, empty, or not a string
 */
function validateMensajeError(value) {
  if (value === null || value === undefined || value === "") {
    throw new Error("mensajeError is required");
  }
  if (typeof value !== "string") {
    throw new Error("mensajeError must be a string");
  }
  const sanitized = sanitizeString(value);
  if (!sanitized || sanitized.trim() === "") {
    throw new Error("mensajeError cannot be empty");
  }
  validateStringLength(sanitized, VALIDATION_LIMITS.mensajeError, "mensajeError");
  return sanitized;
}

/**
 * Validates and sanitizes the detalles field (can be object or string).
 * @param {*} value - Value to validate
 * @returns {Object|string|null} Sanitized value or null
 * @throws {Error} If value is an array or invalid type
 */
function validateDetalles(value) {
  if (value === null || value === undefined) {
    return null;
  }

  // If string, sanitize and validate length
  if (typeof value === "string") {
    const sanitized = sanitizeString(value);
    if (sanitized.length > VALIDATION_LIMITS.detallesMaxSize) {
      throw new Error(`detalles cannot exceed ${VALIDATION_LIMITS.detallesMaxSize} characters`);
    }
    return sanitized || null;
  }

  // If object, validate structure and sanitize internal strings
  if (typeof value === "object" && !Array.isArray(value)) {
    const sanitized = {};
    const detailsString = JSON.stringify(value);
    if (detailsString.length > VALIDATION_LIMITS.detallesMaxSize) {
      throw new Error(`detalles cannot exceed ${VALIDATION_LIMITS.detallesMaxSize} characters when serialized`);
    }

    // Sanitize strings within the object
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === "string") {
        sanitized[sanitizeString(key)] = sanitizeString(val);
      } else if (val !== null && val !== undefined) {
        sanitized[sanitizeString(key)] = val;
      }
    }
    return sanitized;
  }

  // Arrays or other unsupported types
  if (Array.isArray(value)) {
    throw new Error("detalles cannot be an array");
  }

  throw new Error("detalles must be an object or a string");
}

/**
 * Validation middleware for the login-errors endpoint.
 * Validates, sanitizes, and limits the size of all input fields.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next function
 * @returns {void}
 */
export function validateLoginErrorLog(req, res, next) {
  try {
    // Validate that body exists and is an object
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid JSON object",
      });
    }

    // Validate complete payload size
    const payloadSize = JSON.stringify(req.body).length;
    const MAX_PAYLOAD_SIZE = 10000; // 10KB maximum
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return res.status(413).json({
        success: false,
        message: `Payload exceeds maximum allowed size (${MAX_PAYLOAD_SIZE} bytes)`,
      });
    }

    // Validate and sanitize each field
    const sanitizedBody = {
      usuario: validateUsuario(req.body.usuario),
      ipOrigen: validateIpOrigen(req.body.ipOrigen),
      agenteUsuario: validateAgenteUsuario(req.body.agenteUsuario),
      codigoError: validateCodigoError(req.body.codigoError),
      mensajeError: validateMensajeError(req.body.mensajeError),
      detalles: validateDetalles(req.body.detalles),
    };

    // Replace body with sanitized data
    req.body = sanitizedBody;

    // Continue to next middleware
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Input validation error",
    });
  }
}

