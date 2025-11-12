/**
 * @fileoverview Validation rules for role management (create/edit)
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import {
  required,
  maxLength,
  minLength,
  alphanumeric,
  atLeastOne,
  validateForm,
  hasErrors,
  sanitizeMaxLength,
} from "./inputValidationUtils";

/**
 * Field maximum lengths for role forms (based on DB schema)
 */
export const ROLE_FIELD_MAX_LENGTHS = {
  nombre: 50, // varchar(50)
  descripcion: 200, // varchar(200)
};

/**
 * Validation rules for role form fields
 */
export const ROLE_VALIDATION_RULES = {
  nombre: [
    required("El nombre del rol es obligatorio"),
    maxLength(50, "El nombre del rol"),
    alphanumeric(
      "El nombre del rol solo puede contener letras, números y espacios"
    ),
  ],
  descripcion: [maxLength(200, "La descripción")],
};

/**
 * Sanitizes role field values
 * @param {string} fieldName - Name of the field
 * @param {string} value - Current value
 * @returns {string} Sanitized value
 */
export function sanitizeRoleField(fieldName, value) {
  const maxLen = ROLE_FIELD_MAX_LENGTHS[fieldName];
  if (maxLen && typeof value === "string" && value.length > maxLen) {
    return sanitizeMaxLength(value, maxLen);
  }
  return value;
}

/**
 * Validates role form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors
 */
export function validateRoleForm(formData) {
  return validateForm(formData, ROLE_VALIDATION_RULES);
}

/**
 * Checks if role form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if has errors
 */
export function hasRoleErrors(errors) {
  return hasErrors(errors);
}

/**
 * Handles input change with validation and sanitization
 * @param {Event} e - Input change event
 * @param {Function} setFormData - Form data setter
 * @param {Function} setErrors - Errors setter
 */
export function handleRoleInputChange(e, setFormData, setErrors) {
  const { name, value } = e.target;

  // Sanitizar el valor
  const sanitizedValue = sanitizeRoleField(name, value);

  // Actualizar form data
  setFormData((prev) => ({
    ...prev,
    [name]: sanitizedValue,
  }));

  // Validar en tiempo real
  if (ROLE_VALIDATION_RULES[name]) {
    const fieldErrors = validateForm(
      { [name]: sanitizedValue },
      { [name]: ROLE_VALIDATION_RULES[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name],
    }));
  }
}

/**
 * Handles privilege selection change with validation
 * @param {number} privilegeId - Privilege ID
 * @param {Array} selectedPrivileges - Currently selected privileges
 * @param {Function} setSelectedPrivileges - Selected privileges setter
 * @param {Function} setErrors - Errors setter
 */
export function handleRolePrivilegeToggle(
  privilegeId,
  selectedPrivileges,
  setSelectedPrivileges,
  setErrors
) {
  const newPrivileges = selectedPrivileges.includes(privilegeId)
    ? selectedPrivileges.filter((id) => id !== privilegeId)
    : [...selectedPrivileges, privilegeId];

  setSelectedPrivileges(newPrivileges);

  // Validar privilegios en tiempo real
  const fieldErrors = validateForm(
    { privilegios: newPrivileges },
    { privilegios: ROLE_VALIDATION_RULES.privilegios }
  );

  setErrors((prev) => ({
    ...prev,
    privilegios: fieldErrors.privilegios,
  }));
}

/**
 * Checks for duplicate role name
 * @param {string} roleName - Name to check
 * @param {Array} existingRoles - Array of existing roles
 * @param {number} currentRoleId - ID of current role (for edit mode, null for create)
 * @returns {string|null} Error message or null
 */
export function validateUniqueRoleName(
  roleName,
  existingRoles,
  currentRoleId = null
) {
  if (!roleName || !existingRoles) return null;

  const duplicate = existingRoles.find(
    (role) =>
      role.nombre?.toLowerCase() === roleName.toLowerCase() &&
      role.id !== currentRoleId &&
      role.IDRol !== currentRoleId
  );

  return duplicate
    ? "Ya existe un rol con este nombre. Por favor elige otro nombre."
    : null;
}
