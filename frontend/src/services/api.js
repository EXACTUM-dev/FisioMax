/**
 * Version: 0.3.0
 * Servicio base para comunicación con la API
 */

import { useAuth } from "@clerk/clerk-react";

// URL base para todas las peticiones API
const API_BASE_URL = "/api";

/**
 * Función para manejar errores de peticiones API
 * @param {Response} response - Respuesta de fetch
 * @returns {Promise} - Promesa con los datos o rechazada con error
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = {
      status: response.status,
      message: data.error || "Ha ocurrido un error",
      data,
    };

    throw error;
  }

  return data;
}

/**
 * Construye opciones para fetch con autenticación y otros headers
 * @param {object} options - Opciones adicionales para fetch
 * @param {string} token - Token de autenticación
 * @returns {object} - Opciones configuradas para fetch
 */
function buildOptions(options = {}, token) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Agregar token de autenticación si existe
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...defaultOptions,
    ...options,
  };
}

/**
 * Cliente API para realizar peticiones HTTP
 */
export const apiClient = {
  /**
   * Realiza una petición GET
   * @param {string} endpoint - Ruta del endpoint (sin la base URL)
   * @param {object} options - Opciones adicionales para fetch
   * @param {string} token - Token de autenticación
   * @returns {Promise} - Promesa con la respuesta
   */
  async get(endpoint, options = {}, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(
      url,
      buildOptions({ ...options, method: "GET" }, token)
    );
    return handleResponse(response);
  },

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Ruta del endpoint (sin la base URL)
   * @param {object} data - Datos a enviar en el cuerpo
   * @param {object} options - Opciones adicionales para fetch
   * @param {string} token - Token de autenticación
   * @returns {Promise} - Promesa con la respuesta
   */
  async post(endpoint, data, options = {}, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(
      url,
      buildOptions(
        {
          ...options,
          method: "POST",
          body: JSON.stringify(data),
        },
        token
      )
    );
    return handleResponse(response);
  },

  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Ruta del endpoint (sin la base URL)
   * @param {object} data - Datos a enviar en el cuerpo
   * @param {object} options - Opciones adicionales para fetch
   * @param {string} token - Token de autenticación
   * @returns {Promise} - Promesa con la respuesta
   */
  async put(endpoint, data, options = {}, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(
      url,
      buildOptions(
        {
          ...options,
          method: "PUT",
          body: JSON.stringify(data),
        },
        token
      )
    );
    return handleResponse(response);
  },

  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Ruta del endpoint (sin la base URL)
   * @param {object} options - Opciones adicionales para fetch
   * @param {string} token - Token de autenticación
   * @returns {Promise} - Promesa con la respuesta
   */
  async delete(endpoint, options = {}, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(
      url,
      buildOptions(
        {
          ...options,
          method: "DELETE",
        },
        token
      )
    );
    return handleResponse(response);
  },
};
