/**
 * @fileoverview Profile controller for frontend
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Handles fetching user profile data from the backend API
 */

import { fetchWithClerk } from '../utils/api.js';
import { buildApiUrl } from '../config/api.js';

/**
 * Get the current user's profile from the backend
 * @param {string} clerkToken - Clerk JWT token
 * @returns {Promise<Object>} User profile data
 */
export async function getCurrentUserProfile(clerkToken) {
  try {
    const url = buildApiUrl('/api/users/profile');
    const response = await fetchWithClerk(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, clerkToken);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Error al obtener el perfil');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Transform backend user data to frontend format (if needed)
 * This ensures compatibility with the current components
 * @param {Object} userData - Raw user data from backend
 * @returns {Object} Transformed user data
 */
export function transformUserData(userData) {
  if (!userData) return null;

  return {
    // Personal info
    nombres: userData.nombres || '',
    apellidoP: userData.apellidoP || '',
    apellidoM: userData.apellidoM || '',
    email: userData.email || '',
    telefonoCasa: userData.telefonoCasa || '',
    telefonoWhatsApp: userData.telefonoWhatsApp || '',
    licenciatura: userData.licenciatura || '',
    
    // Address info
    pais: userData.pais || '',
    estado: userData.estado || '',
    ciudad: userData.ciudad || '',
    calle: userData.calle || '',
    numExterior: userData.numExterior || '',
    numInterior: userData.numInterior || '',
    colonia: userData.colonia || '',
    codigoPostal: userData.codigoPostal || '',
    numeroExterior: userData.numExterior || '',
    numeroInterior: userData.numInterior || '',
    
    // Social media
    instagram: userData.instagram || '',
    linkedin: userData.linkedin || '',
    facebook: userData.facebook || '',
    paginaWeb: userData.paginaWeb || '',
    
    // Documents
    cedula: userData.cedula || null,
    titulo: userData.titulo || null,
    constancias: userData.constancias || null,
    documentosAdicionales: userData.documentosAdicionales || [],
    
    // Role info
    rol: userData.rol || null,
    IDRol: userData.IDRol || null,
    
    // Additional info
    IDUsuario: userData.IDUsuario,
    createdAt: userData.createdAt,
    
    // Metadata for membership status
    membershipRegisteredAt: userData.membershipRegisteredAt || null,
    membershipExpiresAt: userData.membershipExpiresAt || null,
    membershipPlan: userData.membershipPlan || null,
  };
}

