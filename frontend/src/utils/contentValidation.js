/**
 * @fileoverview Validation rules for multimedia content uploads
 * @version 0.2.0
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
 * File type restrictions per content type
 */
export const CONTENT_FILE_RESTRICTIONS = {
  Articulo: {
    accept: ".pdf",
    types: ["application/pdf"],
    label: "PDF",
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  Libro: {
    accept: ".pdf",
    types: ["application/pdf"],
    label: "PDF",
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  Podcast: {
    accept:
      ".mp3,.mp4,.mov,.webm,audio/mpeg,audio/mp4,video/mp4,video/quicktime,video/webm",
    types: [
      "audio/mpeg",
      "audio/mp4",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ],
    label: "MP3, MP4, MOV, WEBM",
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  Video: {
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    types: ["video/mp4", "video/quicktime", "video/webm"],
    label: "MP4, MOV, WEBM",
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  Descuento: {
    accept: ".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg",
    types: ["image/png", "image/jpeg", "image/jpg"],
    label: "PNG, JPG, JPEG",
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  "Video-SesionesMensuales": {
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    types: ["video/mp4", "video/quicktime", "video/webm"],
    label: "MP4, MOV, WEBM",
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  "Video-SesionesExtraordinarias": {
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    types: ["video/mp4", "video/quicktime", "video/webm"],
    label: "MP4, MOV, WEBM",
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  "Video-SesionesConProveedores": {
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    types: ["video/mp4", "video/quicktime", "video/webm"],
    label: "MP4, MOV, WEBM",
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
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
  file: [required("Debes seleccionar un archivo de contenido")],
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
  { value: "Video-SesionesMensuales", label: "Video: Sesiones Mensuales" },
  { value: "Video-SesionesExtraordinarias", label: "Video: Sesiones Extraordinarias" },
  { value: "Video-SesionesConProveedores", label: "Video: Sesiones con Proveedores" },
  { value: "Podcast", label: "Podcast" },
  { value: "Libro", label: "Libro" },
  { value: "Descuento", label: "Descuento" },
];

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
 * Validates file type based on content type
 * @param {File} file - File to validate
 * @param {string} contentType - Type of content (Articulo, Libro, Podcast, Video)
 * @returns {string|null} Error message or null if valid
 */
export function validateFileType(file, contentType) {
  if (!file) return null;

  const restrictions = CONTENT_FILE_RESTRICTIONS[contentType];
  if (!restrictions) return "Tipo de contenido no válido";

  // Check file type
  const isValidType = restrictions.types.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", ""));
    }
    return file.type === type;
  });

  if (!isValidType) {
    return `Solo se permiten archivos ${restrictions.label} para ${contentType}`;
  }

  // Check file size
  if (file.size > restrictions.maxSize) {
    const maxSizeMB = (restrictions.maxSize / 1024 / 1024).toFixed(0);
    const maxSizeGB =
      restrictions.maxSize >= 1024 * 1024 * 1024
        ? `${(restrictions.maxSize / 1024 / 1024 / 1024).toFixed(1)}GB`
        : `${maxSizeMB}MB`;
    return `El archivo excede el tamaño máximo de ${maxSizeGB}`;
  }

  return null;
}

/**
 * Validates content form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors
 */
export function validateContentForm(formData) {
  const errors = validateForm(formData, CONTENT_VALIDATION_RULES);

  // Additional validation for file type based on content type
  if (formData.file && formData.tipo) {
    const fileError = validateFileType(formData.file, formData.tipo);
    if (fileError) {
      errors.file = fileError;
    }
  }

  return errors;
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
 * Handles content file input changes with type validation
 * @param {Event} e - Input change event
 * @param {string} type - File type (content or thumbnail)
 * @param {string} contentType - Content type for validation
 * @param {Function} setFile - State setter for file
 * @param {Function} setErrors - State setter for errors
 * @returns {string|null} Error message if validation fails
 */
export function handleContentFileChange(
  e,
  type,
  contentType,
  setFile,
  setErrors
) {
  const file = e.target.files?.[0];

  if (!file) {
    setFile(null);
    setErrors((prev) => ({
      ...prev,
      [type === "thumbnail" ? "thumbnail" : "file"]: null,
    }));
    return null;
  }

  // Thumbnail validation
  if (type === "thumbnail") {
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validImageTypes.includes(file.type)) {
      setFile(null);
      const error = "Solo se permiten archivos PNG o JPG para la miniatura";
      setErrors((prev) => ({ ...prev, thumbnail: error }));
      return error;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setFile(null);
      const error = "La miniatura no debe superar los 20MB";
      setErrors((prev) => ({ ...prev, thumbnail: error }));
      return error;
    }

    setFile(file);
    setErrors((prev) => ({ ...prev, thumbnail: null }));
    return null;
  }

  // Content file validation with content type restrictions
  const validationError = validateFileType(file, contentType);

  if (validationError) {
    setFile(null);
    setErrors((prev) => ({ ...prev, file: validationError }));
    return validationError;
  }

  setFile(file);
  setErrors((prev) => ({ ...prev, file: null }));
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
