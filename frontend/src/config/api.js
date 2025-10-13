/**
 * version 1.0.1
 * Configuration to backend's URLs
 * Includes helper to build the complete URLs
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    MEMBERSHIP_APPLICATIONS: '/api/membership-applications',
    CONTACT: '/api/contacto',
    USERS: '/api/usuarios'
  }
};

/**
 * Helper function to build complete URLs
 */
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Espacific URLs to membership application
 */
export const MEMBERSHIP_API = {
  CREATE: buildApiUrl(API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS),
  GET_ALL: buildApiUrl(API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS),
  GET_BY_ID: (id) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}`),
  UPDATE_STATUS: (id) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}/status`),
  DOWNLOAD_DOCUMENT: (id, docType) => buildApiUrl(`${API_CONFIG.ENDPOINTS.MEMBERSHIP_APPLICATIONS}/${id}/documents/${docType}`)
};
