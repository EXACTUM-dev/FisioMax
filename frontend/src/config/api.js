/**
 * @fileoverview Configuration to backend's URLs
 * @author EXACTUM-dev 
 * @version 1.0.1
 * @describe Includes helper to build the complete URLs
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    MEMBERSHIP_APPLICATIONS: '/api/membership-applications',
    CONTACT: '/api/contacto',
    USERS: '/api/users',
    USER_PROFILE: '/api/users/profile',
    AUTH_PROFILE: '/api/auth/profile',
    ROLES: '/api/roles'
  }
};

/**
 * Helper function to build complete URLs
 */
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Helper para hacer requests autenticados con Clerk
 * @param {string} url - URL del endpoint
 * @param {Function} getToken - Función de Clerk para obtener el token
 * @param {Object} options - Opciones adicionales de fetch
 */
export async function authenticatedFetch(url, getToken, options = {}) {
  const token = await getToken();
  
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

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
