/**
 * Utility to provide membership form data for the profile page.
 * It will try to read a saved form from localStorage (key: membershipForm)
 * and fallback to sensible defaults that mirror `membershipApplication` initial state.
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
    numeroExterior: "",
    numeroInterior: "",
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
