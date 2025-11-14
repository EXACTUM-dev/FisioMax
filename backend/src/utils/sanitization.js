/**
 * @fileoverview Sanitization utilities for input validation and XSS prevention
 * @version 1.1.0
 * @author EXACTUM-dev
 * @description Provides generic sanitization functions to prevent XSS attacks.
 * Special handling for URL and social media fields to preserve formatting.
 */

/**
 * Fields that should NOT be HTML-escaped (URLs and social media handles)
 * These fields need to preserve special characters like :, /, @, etc.
 */
const NO_ESCAPE_FIELDS = ["instagram", "linkedin", "facebook", "paginaWeb"];

/**
 * Sanitizes a string by escaping HTML special characters
 * Prevents XSS attacks by converting potentially dangerous characters
 * @param {string} str - String to sanitize
 * @param {boolean} allowSpecialChars - If true, skip HTML escaping for URLs/social media
 * @returns {string} Sanitized string with escaped HTML characters
 */
export function sanitizeString(str, allowSpecialChars = false) {
  if (!str) return "";

  if (typeof str !== "string") {
    str = String(str);
  }

  // For URLs and social media, only trim - don't escape HTML
  if (allowSpecialChars) {
    return str.trim();
  }

  // For regular fields, escape HTML to prevent XSS
  return str
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes multiple string fields in an object
 * Automatically detects URL/social media fields to preserve formatting
 * @param {Object} obj - Object containing fields to sanitize
 * @param {Array<string>} fields - Array of field names to sanitize
 * @returns {Object} New object with sanitized fields
 */
export function sanitizeObject(obj, fields) {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  const sanitized = { ...obj };

  fields.forEach((field) => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      // Check if this field should preserve special characters
      const allowSpecialChars = NO_ESCAPE_FIELDS.includes(field);
      sanitized[field] = sanitizeString(sanitized[field], allowSpecialChars);
    }
  });

  return sanitized;
}

/**
 * Sanitizes an array of strings
 * @param {Array<string>} arr - Array of strings to sanitize
 * @param {boolean} allowSpecialChars - If true, skip HTML escaping
 * @returns {Array<string>} Array with sanitized strings
 */
export function sanitizeArray(arr, allowSpecialChars = false) {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map((item) => sanitizeString(item, allowSpecialChars));
}

/**
 * Validates and sanitizes a numeric ID
 * @param {*} id - ID to validate
 * @returns {number|null} Validated numeric ID or null if invalid
 */
export function sanitizeId(id) {
  const numId = parseInt(id);

  if (isNaN(numId) || numId <= 0) {
    return null;
  }

  return numId;
}

/**
 * Validates and sanitizes an array of numeric IDs
 * @param {Array} ids - Array of IDs to validate
 * @returns {Array<number>} Array of valid numeric IDs
 */
export function sanitizeIdArray(ids) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return ids.map((id) => sanitizeId(id)).filter((id) => id !== null);
}

/**
 * Sanitizes email addresses
 * Only trims and converts to lowercase - no HTML escaping
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email in lowercase
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

/**
 * Validates string length
 * @param {string} str - String to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Field name for error message
 * @throws {Error} If string exceeds max length
 */
export function validateStringLength(str, maxLength, fieldName = "Campo") {
  if (str && str.length > maxLength) {
    throw new Error(
      `${fieldName} no puede exceder los ${maxLength} caracteres`
    );
  }
}

/**
 * Validates that a value is in allowed list
 * @param {*} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @throws {Error} If value is not in allowed list
 */
export function validateAllowedValue(
  value,
  allowedValues,
  fieldName = "Valor"
) {
  if (!allowedValues.includes(value)) {
    throw new Error(
      `${fieldName} no es válido. Valores permitidos: ${allowedValues.join(
        ", "
      )}`
    );
  }
}

/**
 * Validates required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {Error} If any required field is missing or empty
 */
export function validateRequiredFields(obj, requiredFields) {
  const missing = requiredFields.filter((field) => {
    const value = obj[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }
}

/**
 * Comprehensive input sanitization for content creation/update
 * Automatically preserves special characters for URL and social media fields
 * @param {Object} data - Data object to sanitize
 * @param {Object} config - Configuration object with validation rules
 * @param {Array<string>} config.stringFields - Fields to sanitize as strings
 * @param {Array<string>} config.idFields - Fields to sanitize as IDs
 * @param {Array<string>} config.requiredFields - Fields that are required
 * @param {Object} config.maxLengths - Maximum lengths for each field
 * @param {Object} config.allowedValues - Allowed values for specific fields
 * @returns {Object} Sanitized and validated data
 */
export function sanitizeContentInput(data, config = {}) {
  const {
    stringFields = [],
    idFields = [],
    requiredFields = [],
    maxLengths = {},
    allowedValues = {},
  } = config;

  // Validate required fields first
  if (requiredFields.length > 0) {
    validateRequiredFields(data, requiredFields);
  }

  // Sanitize string fields (with automatic detection of URL/social media fields)
  const sanitized = sanitizeObject(data, stringFields);

  // Validate string lengths
  Object.keys(maxLengths).forEach((field) => {
    if (sanitized[field]) {
      validateStringLength(sanitized[field], maxLengths[field], field);
    }
  });

  // Sanitize ID fields
  idFields.forEach((field) => {
    if (data[field] !== undefined) {
      const ids = Array.isArray(data[field]) ? data[field] : [data[field]];
      sanitized[field] = sanitizeIdArray(ids);

      if (!Array.isArray(data[field])) {
        sanitized[field] = sanitized[field][0] || null;
      }
    }
  });

  // Validate allowed values
  Object.keys(allowedValues).forEach((field) => {
    if (sanitized[field] !== undefined) {
      validateAllowedValue(sanitized[field], allowedValues[field], field);
    }
  });

  return sanitized;
}

export default {
  sanitizeString,
  sanitizeObject,
  sanitizeArray,
  sanitizeId,
  sanitizeIdArray,
  sanitizeEmail,
  validateStringLength,
  validateAllowedValue,
  validateRequiredFields,
  sanitizeContentInput,
};
