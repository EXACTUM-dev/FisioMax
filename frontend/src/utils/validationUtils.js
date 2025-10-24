/**
 * @fileoverview Validation utilities for roles
 * @version 0.1.0
 * @author EXACTUM-dev
 */
/**
 * Validate role name for duplicates and empty values.
 * @param {string} name - Role name to validate
 * @param {Array} existingData - Array of existing roles
 * @param {string|number|null} currentDataId - Current role ID for edit mode
 * @returns {Object} - { isValid: boolean, errorMessage: string }
 */
export function validateRoleName(name, existingData, currentDataId) {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      errorMessage: "El nombre del rol no puede estar vacío",
    };
  }

  const isDuplicate = existingData.some(
    (role) =>
      (role.rol || role.name || "").toLowerCase().trim() ===
        name.toLowerCase().trim() && role.id !== currentDataId
  );

  if (isDuplicate) {
    return {
      isValid: false,
      errorMessage: `Ya existe un rol con el nombre "${name}"`,
    };
  }

  return { isValid: true, errorMessage: "" };
}

/**
 * Compare two arrays to check if they represent the same set of values.
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {boolean} - True if both arrays represent the same set
 */
export function areArraysSameSet(a, b) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}
