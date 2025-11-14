/**
 * @fileoverview Validation rules for multimedia content uploads
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import {
  required,
  maxLength,
  fileSize,
  fileType,
  atLeastOne,
  validateForm,
  hasErrors,
  sanitizeMaxLength,
} from "./inputValidationUtils";

/**
 * Field maximum lengths for content forms
 */
export const CONTENT_FIELD_MAX_LENGTHS = {
  nombre: 50,
  descripcion: 500,
};

/**
 * Validation rules for content upload form
 */
export const CONTENT_VALIDATION_RULES = {
  nombre: [
    required("El nombre del archivo es obligatorio"),
    maxLength(50, "El nombre del archivo"),
  ],
  descripcion: [maxLength(500, "La descripción")],
  tipo: [required("El tipo de contenido es obligatorio")],
  roles: [
    atLeastOne(
      "Debes seleccionar al menos un rol al que va dirigido el contenido"
    ),
  ],
  file: [
    required("Debes seleccionar un archivo de contenido"),
    fileSize(5120, "El archivo de contenido"), // 5GB in MB
  ],
  thumbnail: [
    fileSize(20, "La miniatura"),
    fileType(
      ["image/png", "image/jpeg", "image/jpg"],
      "La miniatura debe ser PNG, JPG o JPEG"
    ),
  ],
};

/**
 * Content type options
 */
export const CONTENT_TYPE_OPTIONS = [
  { value: "Articulo", label: "Artículo" },
  { value: "Video", label: "Video" },
  { value: "Podcast", label: "Podcast" },
  { value: "Libro", label: "Libro" },
];

/**
 * Accepted file types for content
 */
export const ACCEPTED_CONTENT_TYPES = "video/*,audio/*,image/*,.pdf,.doc,.docx";

/**
 * Accepted file types for thumbnails
 */
export const ACCEPTED_THUMBNAIL_TYPES = "image/png,image/jpeg,image/jpg";

/**
 * Sanitizes content field values
 * @param {string} fieldName - Name of the field
 * @param {string} value - Current value
 * @returns {string} Sanitized value
 */
export function sanitizeContentField(fieldName, value) {
  const maxLen = CONTENT_FIELD_MAX_LENGTHS[fieldName];
  if (maxLen && typeof value === "string" && value.length > maxLen) {
    return sanitizeMaxLength(value, maxLen);
  }
  return value;
}

/**
 * Validates content form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors
 */
export function validateContentForm(formData) {
  return validateForm(formData, CONTENT_VALIDATION_RULES);
}

/**
 * Checks if content form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if has errors
 */
export function hasContentErrors(errors) {
  return hasErrors(errors);
}

/**
 * Handles input change with validation and sanitization
 * @param {Event} e - Input change event
 * @param {Function} setFormData - Form data setter
 * @param {Function} setErrors - Errors setter
 */
export function handleContentInputChange(e, setFormData, setErrors) {
  const { name, value } = e.target;

  // Sanitizar el valor
  const sanitizedValue = sanitizeContentField(name, value);

  // Actualizar form data
  setFormData((prev) => ({
    ...prev,
    [name]: sanitizedValue,
  }));

  // Validar en tiempo real
  if (CONTENT_VALIDATION_RULES[name]) {
    const fieldErrors = validateForm(
      { [name]: sanitizedValue },
      { [name]: CONTENT_VALIDATION_RULES[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name],
    }));
  }
}

/**
 * Handles file change with validation
 * @param {Event} e - File input change event
 * @param {string} type - Type of file ('content' or 'thumbnail')
 * @param {Function} setFile - File setter
 * @param {Function} setErrors - Errors setter
 * @returns {string|null} Error message or null
 */
export function handleContentFileChange(e, type, setFile, setErrors) {
  const file = e.target.files[0];
  if (!file) return null;

  const rules =
    type === "thumbnail"
      ? CONTENT_VALIDATION_RULES.thumbnail
      : CONTENT_VALIDATION_RULES.file;

  const fieldErrors = validateForm({ file }, { file: rules });

  if (fieldErrors.file) {
    setErrors((prev) => ({
      ...prev,
      [type === "thumbnail" ? "thumbnail" : "file"]: fieldErrors.file,
    }));
    e.target.value = "";
    return fieldErrors.file;
  }

  setFile(file);
  setErrors((prev) => ({
    ...prev,
    [type === "thumbnail" ? "thumbnail" : "file"]: null,
  }));

  return null;
}

/**
 * Handles role selection change with validation
 * @param {string|number} roleId - Role ID
 * @param {Array} selectedRoles - Currently selected roles
 * @param {Function} setSelectedRoles - Selected roles setter
 * @param {Function} setErrors - Errors setter
 */
export function handleContentRoleToggle(
  roleId,
  selectedRoles,
  setSelectedRoles,
  setErrors
) {
  const newRoles = selectedRoles.includes(roleId)
    ? selectedRoles.filter((id) => id !== roleId)
    : [...selectedRoles, roleId];

  setSelectedRoles(newRoles);

  // Validar roles en tiempo real
  const fieldErrors = validateForm(
    { roles: newRoles },
    { roles: CONTENT_VALIDATION_RULES.roles }
  );

  setErrors((prev) => ({
    ...prev,
    roles: fieldErrors.roles,
  }));
}
