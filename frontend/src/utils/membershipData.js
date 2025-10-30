/**
 * @fileoverview Membership data utility for managing form data persistence.
 * Provides functions to retrieve membership form data from localStorage.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * Retrieves membership form data from localStorage or returns defaults.
 * Tries to read saved form from localStorage keys: 'membershipForm' or 'membershipApplication'.
 * @return {!Object} Membership data object with user information.
 */
export function getMembershipData() {
  try {
    const raw = localStorage.getItem('membershipForm') || localStorage.getItem('membershipApplication');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData(), ...parsed };
    }
  } catch (err) {
    // ignore parse errors and return defaults
  }
  return defaultData();
}

function defaultData() {
  return {
    nombres: "",
    apellidoP: "",
    apellidoM: "",
    telefonoCasa: "",
    telefonoWhatsApp: "",
    email: "",
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
    // membership metadata placeholders
    membershipRegisteredAt: null,
    membershipExpiresAt: null,
    membershipPlan: null,
  };
}
