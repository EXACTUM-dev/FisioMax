/**
 * @fileoverview Configuración de URLs del backend
 * @version 1.0.0
 * @author EXACTUM-dev
 */

// Configuración de URLs del backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    MEMBERSHIP_APPLICATIONS: '/api/membership-applications',
    CONTACT: '/api/contacto',
    USERS: '/api/usuarios'
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// URLs específicas para el formulario de membresía
export const MEMBERSHIP_API = {
  CREATE: buildApiUrl(API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS),
  GET_ALL: buildApiUrl(API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS),
  GET_BY_ID: (id) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}`),
  UPDATE_STATUS: (id) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}/status`),
  DOWNLOAD_DOCUMENT: (id, docType) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}/documents/${docType}`)
};
