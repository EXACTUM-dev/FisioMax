/**
 * @fileoverview Input validation system using Strategy pattern for real-time validation
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Provides reusable validation strategies for forms with real-time feedback
 */

/**
 * ===================
 * VALIDATION STRATEGIES
 * ===================
 * Each strategy returns null if valid, or an error message string if invalid
 */

/**
 * Required field validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const required = (customMessage = "Este campo es requerido") => {
  return (value) => {
    if (value === null || value === undefined || value === "") {
      return customMessage;
    }
    if (typeof value === "string" && value.trim() === "") {
      return customMessage;
    }
    return null;
  };
};

/**
 * Minimum length validator
 * @param {number} min - Minimum length
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const minLength = (min, customMessage) => {
  return (value) => {
    if (!value) return null; // Skip if empty (use required() for that)
    const length = String(value).length;
    return length < min ? customMessage || `Mínimo ${min} caracteres` : null;
  };
};

/**
 * Maximum length validator
 * @param {number} max - Maximum length
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const maxLength = (max, customMessage) => {
  return (value) => {
    if (!value) return null;
    const length = String(value).length;
    return length > max ? customMessage || `Máximo ${max} caracteres` : null;
  };
};

/**
 * Exact length validator
 * @param {number} exactLen - Exact length required
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const exactLength = (exactLen, customMessage) => {
  return (value) => {
    if (!value) return null;
    const length = String(value).length;
    return length !== exactLen
      ? customMessage || `Debe tener exactamente ${exactLen} caracteres`
      : null;
  };
};

/**
 * Email format validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const email = (customMessage = "Email inválido") => {
  return (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : customMessage;
  };
};

/**
 * Phone number validator (Mexican format)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const phone = (customMessage = "Teléfono inválido (10-13 dígitos)") => {
  return (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,13}$/;
    return phoneRegex.test(value.replace(/\s/g, "")) ? null : customMessage;
  };
};

/**
 * Numeric only validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const numeric = (customMessage = "Solo se permiten números") => {
  return (value) => {
    if (!value) return null;
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(value) ? null : customMessage;
  };
};

/**
 * Alphabetic only validator (letters and spaces)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const alphabetic = (
  customMessage = "Solo se permiten letras y espacios"
) => {
  return (value) => {
    if (!value) return null;
    const alphaRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return alphaRegex.test(value) ? null : customMessage;
  };
};

/**
 * Alphanumeric validator (letters, numbers, spaces)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const alphanumeric = (
  customMessage = "Solo se permiten letras, números y espacios"
) => {
  return (value) => {
    if (!value) return null;
    const alphanumRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    return alphanumRegex.test(value) ? null : customMessage;
  };
};

/**
 * Custom regex pattern validator
 * @param {RegExp} pattern - Regular expression pattern
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const pattern = (pattern, customMessage = "Formato inválido") => {
  return (value) => {
    if (!value) return null;
    return pattern.test(value) ? null : customMessage;
  };
};

/**
 * Minimum value validator (for numbers)
 * @param {number} min - Minimum value
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const minValue = (min, customMessage) => {
  return (value) => {
    if (!value) return null;
    const num = Number(value);
    return num < min ? customMessage || `El valor mínimo es ${min}` : null;
  };
};

/**
 * Maximum value validator (for numbers)
 * @param {number} max - Maximum value
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const maxValue = (max, customMessage) => {
  return (value) => {
    if (!value) return null;
    const num = Number(value);
    return num > max ? customMessage || `El valor máximo es ${max}` : null;
  };
};

/**
 * Range validator (for numbers)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const range = (min, max, customMessage) => {
  return (value) => {
    if (!value) return null;
    const num = Number(value);
    return num < min || num > max
      ? customMessage || `El valor debe estar entre ${min} y ${max}`
      : null;
  };
};

/**
 * URL validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const url = (customMessage = "URL inválida") => {
  return (value) => {
    if (!value) return null;
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(value) ? null : customMessage;
  };
};

/**
 * Date validator (YYYY-MM-DD format)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const dateFormat = (customMessage = "Fecha inválida") => {
  return (value) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return customMessage;
    const date = new Date(value);
    return isNaN(date.getTime()) ? customMessage : null;
  };
};

/**
 * Age validator (minimum age required)
 * @param {number} minAge - Minimum age required
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const minAge = (minAge, customMessage) => {
  return (value) => {
    if (!value) return null;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age < minAge
      ? customMessage || `Debes tener al menos ${minAge} años`
      : null;
  };
};

/**
 * Match validator (for password confirmation, etc.)
 * @param {Function|string} getCompareValue - Function that returns value to compare or direct value
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const match = (
  getCompareValue,
  customMessage = "Los valores no coinciden"
) => {
  return (value) => {
    if (!value) return null;
    const compareValue =
      typeof getCompareValue === "function"
        ? getCompareValue()
        : getCompareValue;
    return value === compareValue ? null : customMessage;
  };
};

/**
 * CURP validator (Mexican unique population registry code)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const curp = (customMessage = "CURP inválido") => {
  return (value) => {
    if (!value) return null;
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(value.toUpperCase()) ? null : customMessage;
  };
};

/**
 * RFC validator (Mexican tax ID)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const rfc = (customMessage = "RFC inválido") => {
  return (value) => {
    if (!value) return null;
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(value.toUpperCase()) ? null : customMessage;
  };
};

/**
 * Postal code validator (Mexican format)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const postalCode = (
  customMessage = "Código postal inválido (5 dígitos)"
) => {
  return (value) => {
    if (!value) return null;
    const postalRegex = /^[0-9]{5}$/;
    return postalRegex.test(value) ? null : customMessage;
  };
};

/**
 * No special characters validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const noSpecialChars = (
  customMessage = "No se permiten caracteres especiales"
) => {
  return (value) => {
    if (!value) return null;
    const noSpecialRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    return noSpecialRegex.test(value) ? null : customMessage;
  };
};

/**
 * File size validator (in MB)
 * @param {number} maxSizeMB - Maximum file size in megabytes
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const fileSize = (maxSizeMB, customMessage) => {
  return (file) => {
    if (!file) return null;
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size > maxBytes
      ? customMessage || `El archivo debe pesar menos de ${maxSizeMB}MB`
      : null;
  };
};

/**
 * File type validator
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const fileType = (allowedTypes, customMessage) => {
  return (file) => {
    if (!file) return null;
    return allowedTypes.includes(file.type)
      ? null
      : customMessage ||
          `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(
            ", "
          )}`;
  };
};

/**
 * ===================
 * VALIDATION EXECUTOR
 * ===================
 */

/**
 * Validates a value against an array of validation strategies
 * Returns the first error found, or null if all validations pass
 * @param {any} value - Value to validate
 * @param {Array<Function>} strategies - Array of validation functions
 * @returns {string|null} Error message or null
 */
export function validate(value, strategies = []) {
  for (const strategy of strategies) {
    const error = strategy(value);
    if (error) return error;
  }
  return null;
}

/**
 * Validates multiple fields at once
 * @param {Object} formData - Object with form field values
 * @param {Object} validationRules - Object mapping field names to validation strategy arrays
 * @returns {Object} Object mapping field names to error messages (or null)
 *
 * @example
 * const errors = validateForm(formData, {
 *   nombre: [required(), alphabetic(), maxLength(50)],
 *   email: [required(), email()],
 *   edad: [required(), numeric(), minValue(18)]
 * });
 */
export function validateForm(formData, validationRules) {
  const errors = {};

  for (const [fieldName, strategies] of Object.entries(validationRules)) {
    const value = formData[fieldName];
    errors[fieldName] = validate(value, strategies);
  }

  return errors;
}

/**
 * Checks if a form has any errors
 * @param {Object} errors - Errors object from validateForm
 * @returns {boolean} True if there are any errors
 */
export function hasErrors(errors) {
  return Object.values(errors).some((error) => error !== null);
}

/**
 * ===================
 * INPUT SANITIZERS (for real-time prevention)
 * ===================
 */

/**
 * Sanitizes input to only allow numeric characters
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeNumeric = (value) => {
  return value.replace(/[^0-9]/g, "");
};

/**
 * Sanitizes input to only allow alphabetic characters and spaces
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeAlphabetic = (value) => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
};

/**
 * Sanitizes input to only allow alphanumeric characters and spaces
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeAlphanumeric = (value) => {
  return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
};

/**
 * Sanitizes input to enforce maximum length
 * @param {string} value - Input value
 * @param {number} max - Maximum length
 * @returns {string} Sanitized value
 */
export const sanitizeMaxLength = (value, max) => {
  return value.slice(0, max);
};

/**
 * Sanitizes CURP to uppercase and only valid characters
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeCURP = (value) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 18);
};

/**
 * Sanitizes RFC to uppercase and only valid characters
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeRFC = (value) => {
  return value
    .toUpperCase()
    .replace(/[^A-ZÑ&0-9]/g, "")
    .slice(0, 13);
};

/**
 * Sanitizes postal code to only digits
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizePostalCode = (value) => {
  return value.replace(/[^0-9]/g, "").slice(0, 5);
};

/**
 * Sanitizes phone to only digits
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizePhone = (value) => {
  return value.replace(/[^0-9]/g, "").slice(0, 13);
};
