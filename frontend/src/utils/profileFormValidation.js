/**
 * @fileoverview Shared validation and sanitization logic for profile and membership forms
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Centralized validation rules, sanitization handlers, and form field configurations
 * with real-time prevention of invalid input
 */

import {
  required,
  email,
  phone,
  minLength,
  maxLength,
  alphabetic,
  alphanumeric,
  dateFormat,
  minAge,
  fileSize,
  fileType,
  validate,
  validateForm,
  hasErrors,
  sanitizeAlphabetic,
  sanitizeNumeric,
  sanitizePhone,
  sanitizePostalCode,
  sanitizeMaxLength,
} from "./inputValidationUtils";

/**
 * Career options for license/degree dropdown
 */
export const CAREER_OPTIONS = [
  "Fisioterapia",
  "Terapia Física",
  "Rehabilitación",
  "Kinesiología",
  "Terapia Ocupacional",
  "Medicina",
  "Enfermería",
  "Psicología",
  "Educación Física",
  "Ciencias del Deporte",
  "Quiropráctica",
  "Osteopatía",
  "Nutrición",
  "Gerontología",
  "Otra",
];

/**
 * Field maximum lengths for character limit enforcement
 * @type {Object.<string, number>}
 */
export const FIELD_MAX_LENGTHS = {
  // Personal Information
  nombres: 60, // varchar(60)
  apellidoP: 60, // varchar(60)
  apellidoM: 60, // varchar(60)

  // Contact Information
  email: 60, // varchar(60)
  correo: 60, // varchar(60)
  telefonoProfesional: 13, // varchar(13)
  telefonoWhatsapp: 13, // varchar(13)
  telefono: 13, // varchar(13)

  // Address Information
  pais: 60, // varchar(60)
  estado: 60, // varchar(60)
  ciudad: 60, // varchar(60)
  colonia: 60, // varchar(60)
  codigoPostal: 5, // varchar(60)
  calle: 25, // varchar(25)
  numExterior: 10, // varchar(10)
  numInterior: 10, // varchar(10)

  // Professional Information
  licenciatura: 100, // varchar(100)

  // Social Media
  instagram: 25, // varchar(25)
  linkedin: 25, // varchar(25)
  facebook: 25, // varchar(25)
  paginaWeb: 255, // varchar(255)

  // Documents (S3 keys)
  foto: 60, // varchar(60)
  cedula: 60, // varchar(60)
  titulo: 60, // varchar(60)
  constancias: 255, // varchar(255)
};

/**
 * Validation rules for profile/membership form fields
 */
export const PROFILE_VALIDATION_RULES = {
  // Personal Information
  nombres: [
    required("El nombre es requerido"),
    alphabetic("Solo se permiten letras y espacios"),
    minLength(2, "El nombre"),
    maxLength(60, "El nombre"),
  ],
  apellidoP: [
    required("El apellido paterno es requerido"),
    alphabetic("Solo se permiten letras y espacios"),
    minLength(2, "El apellido paterno"),
    maxLength(60, "El apellido paterno"),
  ],
  apellidoM: [
    alphabetic("Solo se permiten letras y espacios"),
    maxLength(60, "El apellido materno"),
  ],

  // Contact Information
  email: [
    required("El correo electrónico es requerido"),
    email(),
    maxLength(60, "El correo"),
  ],
  telefonoProfesional: [phone()],
  telefonoWhatsapp: [required("El contacto personal es requerido"), phone()],
  telefono: [phone()],

  // Birth Information
  fechaNacimiento: [
    required("La fecha de nacimiento es requerida"),
    dateFormat(),
    minAge(15),
  ],

  // Address Information
  pais: [maxLength(60, "El país")],
  estado: [maxLength(60, "El estado")],
  ciudad: [maxLength(60, "La ciudad")],
  codigoPostal: [maxLength(5, "El código postal")],
  calle: [
    alphanumeric("Solo se permiten letras, números y espacios"),
    maxLength(25, "La calle"),
  ],
  numExterior: [
    alphanumeric("Solo se permiten letras y números"),
    maxLength(10, "El número exterior"),
  ],
  numInterior: [
    alphanumeric("Solo se permiten letras y números"),
    maxLength(10, "El número interior"),
  ],
  colonia: [
    alphanumeric("Solo se permiten letras, números y espacios"),
    maxLength(60, "La colonia"),
  ],

  // Professional Information
  licenciatura: [maxLength(100, "La licenciatura")],

  membershipType: [required("El tipo de membresía es requerido")],

  // Social Media
  instagram: [maxLength(25, "Instagram")],
  linkedin: [maxLength(25, "LinkedIn")],
  facebook: [maxLength(25, "Facebook")],
  paginaWeb: [maxLength(255, "La página web")],

  // Documents
  titulo: [
    required("El título es requerido"),
    fileType(["application/pdf"], "El título"),
    fileSize(10, "El título"),
  ],
  cedula: [
    fileType(["application/pdf"], "La cédula"),
    fileSize(10, "La cédula"),
  ],
  constancias: [
    fileType(["application/pdf"], "Las constancias"),
    fileSize(10, "Las constancias"),
  ],
};

/**
 * Field labels mapping
 */
export const FIELD_LABELS = {
  nombres: "Nombre(s)",
  apellidoP: "Apellido Paterno",
  apellidoM: "Apellido Materno",
  email: "Correo electrónico",
  correo: "Correo electrónico",
  fechaNacimiento: "Fecha de nacimiento",
  telefonoProfesional: "Contacto profesional",
  telefonoWhatsapp: "Contacto personal",
  telefono: "Teléfono",
  pais: "País",
  estado: "Estado/Provincia",
  ciudad: "Ciudad",
  colonia: "Colonia",
  codigoPostal: "Código Postal",
  calle: "Calle",
  numExterior: "Número exterior",
  numInterior: "Número interior",
  licenciatura: "Licenciatura",
  membershipType: "Tipo de membresía",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  paginaWeb: "Página web",
  titulo: "Título/Kardex",
  cedula: "Cédula profesional",
  constancias: "Constancias pélvicas",
};

/**
 * Gets user-friendly field label
 * @param {string} fieldName - Field name
 * @returns {string} User-friendly label
 */
export function getFieldLabel(fieldName) {
  return FIELD_LABELS[fieldName] || fieldName;
}

/**
 * Sanitizes input value with character limit enforcement
 * @param {string} fieldName - Name of the form field
 * @param {string} value - Current input value
 * @returns {string} Sanitized and truncated value
 */
export function sanitizeFieldValue(fieldName, value) {
  let sanitized;

  // Apply type-specific sanitization
  switch (fieldName) {
    case "nombres":
    case "apellidoP":
    case "apellidoM":
      sanitized = sanitizeAlphabetic(value);
      break;

    case "telefonoProfesional":
    case "telefonoWhatsapp":
    case "telefono":
      sanitized = sanitizePhone(value);
      break;

    case "codigoPostal":
      sanitized = sanitizePostalCode(value);
      break;

    case "numExterior":
    case "numInterior":
      sanitized = sanitizeNumeric(value);
      break;

    case "instagram":
    case "linkedin":
    case "facebook":
    case "paginaWeb":
      sanitized = value;
      break;

    default:
      sanitized = value;
      break;
  }

  // Enforce maximum length (preventive blocking)
  const maxLen = FIELD_MAX_LENGTHS[fieldName];
  if (maxLen && sanitized.length > maxLen) {
    sanitized = sanitizeMaxLength(sanitized, maxLen);
  }

  return sanitized;
}

/**
 * Calculates maximum date (15 years ago from today) for birth date inputs
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getMaxBirthDate() {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 15,
    today.getMonth(),
    today.getDate()
  );
  return maxDate.toISOString().split("T")[0];
}

/**
 * Formats date from ISO string to dd/mm/yyyy for display
 * @param {string} dateString - ISO date string or date string
 * @returns {string} Formatted date as dd/mm/yyyy
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Converts date to YYYY-MM-DD format for input type="date"
 * @param {string|Date} dateString - Date string in any format or Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForInput(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
}

/**
 * Validates form on submission and returns validation results
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules to apply
 * @returns {Object} { isValid, errors, missingFields }
 */
export function validateFormSubmission(formData, rules) {
  const errors = validateForm(formData, rules);
  const missingFields = [];

  // Check for missing required fields
  Object.keys(rules).forEach((fieldName) => {
    const fieldRules = rules[fieldName];
    const hasRequiredRule = fieldRules.some((rule) => rule.name === "required");

    if (hasRequiredRule) {
      const value = formData[fieldName];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        // Get field label from FIELD_LABELS or use field name
        const fieldLabel = getFieldLabel(fieldName);
        missingFields.push(fieldLabel);
      }
    }
  });

  return {
    isValid: !hasErrors(errors),
    errors,
    missingFields,
  };
}

/**
 * Handles input change with real-time validation and sanitization
 * @param {Event} e - Input change event
 * @param {Function} setFormData - Form data setter
 * @param {Function} setErrors - Errors setter
 * @param {Object} customRules - Custom validation rules (defaults to PROFILE_VALIDATION_RULES)
 */
export function handleValidatedInputChange(
  e,
  setFormData,
  setErrors,
  customRules = PROFILE_VALIDATION_RULES
) {
  const { name, value } = e.target;

  // Sanitize and enforce limits
  const sanitizedValue = sanitizeFieldValue(name, value);

  // Update form data
  setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

  // Real-time validation
  if (customRules[name]) {
    const error = validate(sanitizedValue, customRules[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }
}

/**
 * Handles file input change with validation
 * @param {Event} e - File input change event
 * @param {Function} setFormData - Form data setter
 * @param {Function} setErrors - Errors setter
 * @param {Object} customRules - Custom validation rules (defaults to PROFILE_VALIDATION_RULES)
 */
export function handleValidatedFileChange(
  e,
  setFormData,
  setErrors,
  customRules = PROFILE_VALIDATION_RULES
) {
  const { name, files } = e.target;
  const file = files[0] || null;

  setFormData((prev) => ({ ...prev, [name]: file }));

  if (customRules[name]) {
    const error = validate(file, customRules[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }
}

/**
 * Extra documents validation rules
 */
export const EXTRA_DOC_RULES = [
  fileType(["application/pdf"], "Solo se aceptan archivos PDF"),
  fileSize(10, "El archivo no puede ser mayor a 10MB"),
];

/**
 * Validates extra document file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateExtraDocument(file) {
  return validate(file, EXTRA_DOC_RULES);
}

/**
 * API field mapping (Spanish to English)
 */
export const API_FIELD_MAPPING = {
  nombres: "firstName",
  apellidoP: "lastName",
  apellidoM: "middleName",
  telefonoProfesional: "professionalPhone",
  telefonoWhatsapp: "whatsappPhone",
  email: "email",
  correo: "email",
  fechaNacimiento: "birthDate",
  pais: "country",
  estado: "state",
  ciudad: "city",
  colonia: "neighborhood",
  codigoPostal: "postalCode",
  calle: "street",
  numExterior: "exteriorNumber",
  numInterior: "interiorNumber",
  licenciatura: "degree",
  instagram: "instagram",
  linkedin: "linkedin",
  facebook: "facebook",
  paginaWeb: "website",
  titulo: "degreeDocument",
  cedula: "professionalId",
  constancias: "certificates",
};

/**
 * Prepares form data for API submission
 * @param {Object} formData - Form data object
 * @param {Array} extraDocs - Extra documents array
 * @returns {FormData} Prepared FormData object
 */
export function prepareFormDataForSubmission(formData, extraDocs = []) {
  const formDataToSend = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      const englishKey = API_FIELD_MAPPING[key] || key;
      formDataToSend.append(
        englishKey,
        typeof value === "string" ? value.trim() : value
      );
    }
  });

  extraDocs.forEach((doc, i) => {
    if (doc.file) {
      formDataToSend.append(`extraDoc${i + 1}`, doc.file);
    }
  });

  return formDataToSend;
}

/**
 * Initial form state
 */
export const INITIAL_FORM_STATE = {
  nombres: "",
  apellidoP: "",
  apellidoM: "",
  telefonoProfesional: "",
  telefonoWhatsapp: "",
  telefono: "",
  email: "",
  correo: "",
  fechaNacimiento: "",
  pais: "Mexico",
  estado: "",
  ciudad: "",
  calle: "",
  numExterior: "",
  numInterior: "",
  colonia: "",
  codigoPostal: "",
  licenciatura: "",
  membershipType: "",
  instagram: "",
  linkedin: "",
  facebook: "",
  paginaWeb: "",
  titulo: null,
  cedula: null,
  constancias: null,
};

/**
 * Populates form from user data
 * @param {Object} userData - User data object
 * @returns {Object} Populated form data
 */
export function populateFormFromUserData(userData) {
  if (!userData) return { ...INITIAL_FORM_STATE };

  return {
    nombres: userData.nombres || "",
    apellidoP: userData.apellidoP || "",
    apellidoM: userData.apellidoM || "",
    telefonoProfesional: userData.telefonoProfesional || "",
    telefonoWhatsapp: userData.telefonoWhatsapp || "",
    telefono: userData.telefono || "",
    email: userData.email || userData.correo || "",
    correo: userData.correo || userData.email || "",
    fechaNacimiento: userData.fechaNacimiento || "",
    pais: userData.pais || "",
    estado: userData.estado || "",
    ciudad: userData.ciudad || "",
    calle: userData.calle || "",
    numExterior: userData.numExterior || "",
    numInterior: userData.numInterior || "",
    colonia: userData.colonia || "",
    codigoPostal: userData.codigoPostal || "",
    licenciatura: userData.licenciatura || "",
    instagram: userData.instagram || "",
    linkedin: userData.linkedin || "",
    facebook: userData.facebook || "",
    paginaWeb: userData.paginaWeb || "",
    titulo: null,
    cedula: null,
    constancias: null,
  };
}
