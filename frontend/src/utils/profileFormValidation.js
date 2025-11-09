/**
 * @fileoverview Shared validation and sanitization logic for profile and membership forms
 * @version 0.1.0
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
  numeric,
  postalCode,
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
  nombres: 50,
  apellidoP: 50,
  apellidoM: 50,
  email: 100,
  telefonoCasa: 13,
  telefonoWhatsApp: 13,
  telefono: 13,
  codigoPostal: 5,
  calle: 100,
  numExterior: 10,
  numInterior: 10,
  colonia: 100,
  licenciatura: 100,
  instagram: 50,
  linkedin: 100,
  facebook: 100,
  paginaWeb: 200,
};
/**
 * Validates entire form with custom or default rules
 * @param {Object} formData - Form data to validate
 * @param {Object} customRules - Custom validation rules (optional, defaults to PROFILE_VALIDATION_RULES)
 */
export function validateFormSubmission(
  formData,
  customRules = PROFILE_VALIDATION_RULES
) {
  const formErrors = validateForm(formData, customRules);

  const missingFields = [];
  Object.entries(formErrors).forEach(([field, error]) => {
    if (error && error.includes("requerido")) {
      if (FIELD_LABELS[field]) {
        missingFields.push(FIELD_LABELS[field]);
      }
    }
  });

  return {
    errors: formErrors,
    missingFields,
    isValid: !hasErrors(formErrors),
  };
}

/**
 * Validation rules for profile/membership form fields
 */
export const PROFILE_VALIDATION_RULES = {
  // Personal Information
  nombres: [
    required("El nombre es requerido"),
    alphabetic("Solo se permiten letras y espacios"),
    minLength(2, "El nombre"),
    maxLength(50, "El nombre"),
  ],
  apellidoP: [
    required("El apellido paterno es requerido"),
    alphabetic("Solo se permiten letras y espacios"),
    minLength(2, "El apellido paterno"),
    maxLength(50, "El apellido paterno"),
  ],
  apellidoM: [
    alphabetic("Solo se permiten letras y espacios"),
    maxLength(50, "El apellido materno"),
  ],

  // Contact Information
  email: [
    required("El correo electrónico es requerido"),
    email(),
    maxLength(100, "El correo"),
  ],
  telefonoCasa: [phone()],
  telefonoWhatsApp: [required("El contacto personal es requerido"), phone()],
  telefono: [phone()],

  // Birth Information
  fechaNacimiento: [
    required("La fecha de nacimiento es requerida"),
    dateFormat(),
    minAge(15),
  ],

  // Address Information
  codigoPostal: [postalCode()],
  calle: [
    alphanumeric("Solo se permiten letras, números y espacios"),
    maxLength(100, "La calle"),
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
    maxLength(100, "La colonia"),
  ],

  // Professional Information
  licenciatura: [maxLength(100, "La licenciatura")],

  // Social Media
  instagram: [maxLength(50, "Instagram")],
  linkedin: [maxLength(100, "LinkedIn")],
  facebook: [maxLength(100, "Facebook")],
  paginaWeb: [maxLength(200, "La página web")],

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
  fechaNacimiento: "Fecha de nacimiento",
  telefonoCasa: "Contacto profesional",
  telefonoWhatsApp: "Contacto personal",
  pais: "País",
  estado: "Estado/Provincia",
  ciudad: "Ciudad",
  colonia: "Colonia",
  codigoPostal: "Código Postal",
  calle: "Calle",
  numExterior: "Número exterior",
  numInterior: "Número interior",
  licenciatura: "Licenciatura",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  paginaWeb: "Página web",
  titulo: "Título/Kardex",
  cedula: "Cédula profesional",
  constancias: "Constancias pélvicas",
  telefono: "Teléfono",
};

/**
 * Sanitizes input value with character limit enforcement
 * @param {string} fieldName - Name of the form field
 * @param {string} value - Current input value
 * @returns {string} Sanitized and truncated value
 */
export function sanitizeFieldValue(fieldName, value) {
  let sanitized = value;

  // Apply type-specific sanitization
  switch (fieldName) {
    case "nombres":
    case "apellidoP":
    case "apellidoM":
      sanitized = sanitizeAlphabetic(value);
      break;

    case "telefonoCasa":
    case "telefonoWhatsApp":
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
 * @param {string} dateString - Date string in any format
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
    return "";
  }
}

/**
 * Handles input change with real-time validation and sanitization
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
 * Extra documents validation
 */
export const EXTRA_DOC_RULES = [
  fileType(["application/pdf"], "Solo se aceptan archivos PDF"),
  fileSize(10, "El archivo no puede ser mayor a 10MB"),
];

export function validateExtraDocument(file) {
  return validate(file, EXTRA_DOC_RULES);
}

/**
 * API field mapping
 */
export const API_FIELD_MAPPING = {
  nombres: "firstName",
  apellidoP: "lastName",
  apellidoM: "middleName",
  telefonoCasa: "homePhone",
  telefonoWhatsApp: "whatsappPhone",
  telefono: "homePhone",
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
 */
export function prepareFormDataForSubmission(formData, extraDocs = []) {
  const formDataToSend = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
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
  telefonoCasa: "",
  telefonoWhatsApp: "",
  telefono: "",
  email: "",
  correo: "",
  fechaNacimiento: "",
  pais: "",
  estado: "",
  ciudad: "",
  calle: "",
  numExterior: "",
  numInterior: "",
  colonia: "",
  codigoPostal: "",
  licenciatura: "",
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
 */
export function populateFormFromUserData(userData) {
  if (!userData) return { ...INITIAL_FORM_STATE };

  return {
    nombres: userData.nombres || "",
    apellidoP: userData.apellidoP || "",
    apellidoM: userData.apellidoM || "",
    telefonoCasa: userData.telefonoCasa || "",
    telefonoWhatsApp: userData.telefonoWhatsApp || "",
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
