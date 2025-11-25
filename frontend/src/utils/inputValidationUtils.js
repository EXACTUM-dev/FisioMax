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
 * FACTORY FUNCTION: Creates length validators with consistent messaging
 * @param {string} type - Type of length validation ('min', 'max', 'exact')
 * @param {number} length - The length value
 * @param {string} fieldLabel - Human-readable field name (e.g., "El nombre")
 * @returns {Function} Validation function
 */
export const createLengthValidator = (
  type,
  length,
  fieldLabel = "Este campo"
) => {
  const messages = {
    min: `${fieldLabel} debe tener al menos ${length} caracteres`,
    max: `${fieldLabel} no puede exceder ${length} caracteres`,
    exact: `${fieldLabel} debe tener exactamente ${length} caracteres`,
  };

  return (value) => {
    if (!value) return null;
    const len = String(value).length;

    switch (type) {
      case "min":
        return len < length ? messages.min : null;
      case "max":
        return len > length ? messages.max : null;
      case "exact":
        return len !== length ? messages.exact : null;
      default:
        return null;
    }
  };
};

/**
 * Minimum length validator (using factory)
 * @param {number} min - Minimum length
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const minLength = (min, fieldLabel) => {
  return createLengthValidator("min", min, fieldLabel);
};

/**
 * Maximum length validator (using factory)
 * @param {number} max - Maximum length
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const maxLength = (max, fieldLabel) => {
  return createLengthValidator("max", max, fieldLabel);
};

/**
 * Exact length validator (using factory)
 * @param {number} exactLen - Exact length required
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const exactLength = (exactLen, fieldLabel) => {
  return createLengthValidator("exact", exactLen, fieldLabel);
};

/**
 * Email format validator
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const email = (customMessage = "Formato de correo inválido") => {
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
 * FACTORY FUNCTION: Creates numeric range validators with consistent messaging
 * @param {string} type - Type of validation ('min', 'max', 'range')
 * @param {number} value1 - First value (min or exact value)
 * @param {number} value2 - Second value (only for range)
 * @param {string} fieldLabel - Human-readable field name
 * @returns {Function} Validation function
 */
export const createValueValidator = (
  type,
  value1,
  value2,
  fieldLabel = "El valor"
) => {
  const messages = {
    min: `${fieldLabel} debe ser al menos ${value1}`,
    max: `${fieldLabel} no puede ser mayor a ${value1}`,
    range: `${fieldLabel} debe estar entre ${value1} y ${value2}`,
  };

  return (value) => {
    if (!value) return null;
    const num = Number(value);

    switch (type) {
      case "min":
        return num < value1 ? messages.min : null;
      case "max":
        return num > value1 ? messages.max : null;
      case "range":
        return num < value1 || num > value2 ? messages.range : null;
      default:
        return null;
    }
  };
};

/**
 * Minimum value validator (using factory)
 * @param {number} min - Minimum value
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const minValue = (min, fieldLabel) => {
  return createValueValidator("min", min, null, fieldLabel);
};

/**
 * Maximum value validator (using factory)
 * @param {number} max - Maximum value
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const maxValue = (max, fieldLabel) => {
  return createValueValidator("max", max, null, fieldLabel);
};

/**
 * Range validator (using factory)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const range = (min, max, fieldLabel) => {
  return createValueValidator("range", min, max, fieldLabel);
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
export const dateFormat = (customMessage = "Formato de fecha inválido") => {
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
 * FACTORY FUNCTION: Creates file validators with consistent messaging
 * @param {string} type - Type of validation ('size' or 'type')
 * @param {number|string[]} constraint - Size in MB or array of allowed MIME types
 * @param {string} fieldLabel - Human-readable field name
 * @returns {Function} Validation function
 */
export const createFileValidator = (
  type,
  constraint,
  fieldLabel = "El archivo"
) => {
  if (type === "size") {
    const maxSizeMB = constraint;
    return (file) => {
      if (!file) return null;
      const maxBytes = maxSizeMB * 1024 * 1024;
      return file.size > maxBytes
        ? `${fieldLabel} no puede ser mayor a ${maxSizeMB}MB`
        : null;
    };
  }

  if (type === "type") {
    const allowedTypes = constraint;
    return (file) => {
      if (!file) return null;
      return allowedTypes.includes(file.type)
        ? null
        : `${fieldLabel} debe ser de tipo: ${allowedTypes
            .map((t) => t.split("/")[1].toUpperCase())
            .join(", ")}`;
    };
  }

  return () => null;
};

/**
 * File size validator (using factory)
 * @param {number} maxSizeMB - Maximum file size in megabytes
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const fileSize = (maxSizeMB, fieldLabel) => {
  return createFileValidator("size", maxSizeMB, fieldLabel);
};

/**
 * File type validator (using factory)
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {string} fieldLabel - Field label or custom message
 * @returns {Function} Validation function
 */
export const fileType = (allowedTypes, fieldLabel) => {
  return createFileValidator("type", allowedTypes, fieldLabel);
};

/**
 * Content name validator (for multimedia uploads)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const contentName = (
  customMessage = "El nombre del archivo es obligatorio"
) => {
  return (value) => {
    if (!value || !value.trim()) {
      return customMessage;
    }
    if (value.length > 50) {
      return "El nombre del archivo no puede exceder los 50 caracteres";
    }
    return null;
  };
};

/**
 * Content description validator (for multimedia uploads)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const contentDescription = (customMessage) => {
  return (value) => {
    if (!value) return null; // Description is optional
    if (value.length > 500) {
      return (
        customMessage || "La descripción no puede exceder los 500 caracteres"
      );
    }
    return null;
  };
};

/**
 * At least one selection validator (for checkboxes/multi-select)
 * @param {string} customMessage - Custom error message
 * @returns {Function} Validation function
 */
export const atLeastOne = (
  customMessage = "Debes seleccionar al menos una opción"
) => {
  return (value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return customMessage;
    }
    return null;
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
 *   nombre: [required(), alphabetic(), maxLength(50, "El nombre")],
 *   email: [required(), email()],
 *   edad: [required(), numeric(), minValue(18, "La edad")]
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
 * FACTORY FUNCTION: Creates sanitizer functions
 * @param {string} type - Type of sanitization ('numeric', 'alphabetic', 'alphanumeric', etc.)
 * @param {number} maxLength - Optional maximum length
 * @returns {Function} Sanitizer function
 */
export const createSanitizer = (type, maxLength = null) => {
  const patterns = {
    numeric: /[^0-9]/g,
    alphabetic: /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
    alphanumeric: /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,
    phone: /[^0-9]/g,
    postal: /[^0-9]/g,
    curp: /[^A-Z0-9]/g,
    rfc: /[^A-ZÑ&0-9]/g,
  };

  const limits = {
    phone: 13,
    postal: 5,
    curp: 18,
    rfc: 13,
  };

  return (value) => {
    let sanitized = value;

    // Apply pattern if exists
    if (patterns[type]) {
      sanitized = value.replace(patterns[type], "");
    }

    // Apply uppercase for CURP and RFC
    if (type === "curp" || type === "rfc") {
      sanitized = sanitized.toUpperCase();
    }

    // Apply length limit
    const limit = maxLength || limits[type];
    if (limit && sanitized.length > limit) {
      sanitized = sanitized.slice(0, limit);
    }

    return sanitized;
  };
};

/**
 * Sanitizes input to only allow numeric characters
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeNumeric = createSanitizer("numeric");

/**
 * Sanitizes input to only allow alphabetic characters and spaces
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeAlphabetic = createSanitizer("alphabetic");

/**
 * Sanitizes input to only allow alphanumeric characters and spaces
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeAlphanumeric = createSanitizer("alphanumeric");

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
 * Sanitizes CURP to uppercase and only valid characters (using factory)
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeCURP = createSanitizer("curp");

/**
 * Sanitizes RFC to uppercase and only valid characters (using factory)
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizeRFC = createSanitizer("rfc");

/**
 * Sanitizes postal code to only digits (using factory)
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizePostalCode = createSanitizer("postal");

/**
 * Sanitizes phone to only digits (using factory)
 * @param {string} value - Input value
 * @returns {string} Sanitized value
 */
export const sanitizePhone = createSanitizer("phone");
