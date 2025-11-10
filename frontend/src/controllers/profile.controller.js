/**
 * @fileoverview Profile controller for frontend
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Handles fetching user profile data from the backend API
 */

import { fetchWithClerk } from "../utils/api.js";
import { buildApiUrl } from "../config/api.js";

/**
 * Get the current user's profile from the backend
 * @param {string} clerkToken - Clerk JWT token
 * @returns {Promise<Object>} User profile data
 */
export async function getCurrentUserProfile(clerkToken) {
  try {
    const url = buildApiUrl("/api/users/profile");
    const response = await fetchWithClerk(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      clerkToken
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || "Error al obtener el perfil");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Get a specific user's profile by ID from the backend
 * @param {string} userId - User database ID
 * @param {string} clerkToken - Clerk JWT token
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfileById(userId, clerkToken) {
  try {
    const url = buildApiUrl(`/api/users/${userId}`);
    const response = await fetchWithClerk(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      clerkToken
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(
        response.error || "Error al obtener el perfil del usuario"
      );
    }
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
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
    nombres: userData.nombres || "",
    apellidoP: userData.apellidoP || "",
    apellidoM: userData.apellidoM || "",
    email: userData.email || "",
    telefono: userData.telefono || "",
    fechaNacimiento: userData.fechaNacimiento || "",
    foto: userData.foto || null,
    licenciatura: userData.licenciatura || "",

    // Address info
    pais: userData.pais || "",
    estado: userData.estado || "",
    ciudad: userData.ciudad || "",
    calle: userData.calle || "",
    numExterior: userData.numExterior || "",
    numInterior: userData.numInterior || "",
    colonia: userData.colonia || "",
    codigoPostal: userData.codigoPostal || "",

    // Social media
    instagram: userData.instagram || "",
    linkedin: userData.linkedin || "",
    facebook: userData.facebook || "",
    paginaWeb: userData.paginaWeb || "",

    // Documents
    cedula: userData.cedula || null,
    titulo: userData.titulo || null,
    constancias: userData.constancias || null,
    documentosadicionales: userData.documentosadicionales || [],

    // Role info
    rol: userData.rol || null,
    IDRol: userData.IDRol || null,

    // Additional info
    IDUsuario: userData.IDUsuario,
    clerkID: userData.clerkID,
    createdAt: userData.createdAt,
  };
}

/**
 * Update a user's data by ID
 * @param {string} userId - database IDUsuario
 * @param {Object} payload - fields to update
 * @param {string} clerkToken
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserById(userId, payload, clerkToken) {
  try {
    const url = buildApiUrl(`/api/users/${userId}`);
    const response = await fetchWithClerk(
      url,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      clerkToken
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || "No se pudo actualizar el usuario");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Update user documents (titulo, cedula, constancias)
 * @param {string} userId - database IDUsuario
 * @param {FormData} formData - FormData containing files
 * @param {string} clerkToken
 * @returns {Promise<Object>} Updated user data with fresh presigned URLs
 */
export async function updateUserDocuments(userId, formData, clerkToken) {
  try {
    const url = buildApiUrl(`/api/users/${userId}/documents`);
    const headers = {};

    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Error desconocido" }));
      throw new Error(
        errorData.error || "No se pudieron actualizar los documentos"
      );
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(
        result.error || "No se pudieron actualizar los documentos"
      );
    }
  } catch (error) {
    console.error("Error updating user documents:", error);
    throw error;
  }
}
