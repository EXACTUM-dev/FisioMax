/**
 * @fileoverview Base service for the comunication with the API
 * @author EXACTUM-dev
 * @version 0.2.0
 */

import { useAuth } from "@clerk/clerk-react";

// Base URL for all API requests
const API_BASE_URL = "/api";

/**
 * Handles API response and throws error for non-OK responses.
 * @param {Response} response - Fetch API response object.
 * @returns {Promise} - PParsed JSON response data.
 * @throws {ApiError} - When response is not OK
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    // Create proper Error instance with response information
    const error = new Error(data.error || data.message || "Ha ocurrido un error");
    
    // Attach response information in a format compatible with error handling
    error.response = {
      status: response.status,
      data: data,
    };
    
    // Also attach status directly for backward compatibility
    error.status = response.status;
    
    // Add code specific status codes
    if (response.status === 409) {
      error.code = "CONFLICT";
    } else if (response.status >= 500) {
      error.code = "SERVER_ERROR";
    } else if (response.status >= 400) {
      error.code = "CLIENT_ERROR";
    }

    throw error;
  }

  return data;
}

/**
 * Builds fetch options with authentication and default headers.
 * @param {object} options - Additional fetch options.
 * @param {string} token - Authentication token.
 * @returns {object} - Configured fetch options.
 */
function buildOptions(options = {}, token) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add authentification token if exist
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...defaultOptions,
    ...options,
  };
}

/**
 * HTTP client for making authenticated API requests.
 * @type {Object}
 */
export const apiClient = {
  /**
   * Performs GET request.
   * @param {string} endpoint - API endpoint path (without base URL).
   * @param {object} options - Additional fetch options.
   * @param {string} token - Authentication token.
   * @returns {Promise} - API response data.
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
   * Performs POST request.
   * @param {string} endpoint - API endpoint path (without base URL).
   * @param {!Object} data - Request body data.
   * @param {!Object=} options - Additional fetch options.
   * @param {?string=} token - Authentication token.
   * @return {!Promise<!Object>} API response data.
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
   * Performs PUT request.
   * @param {string} endpoint - API endpoint path (without base URL).
   * @param {!Object} data - Request body data.
   * @param {!Object=} options - Additional fetch options.
   * @param {?string=} token - Authentication token.
   * @return {!Promise<!Object>} API response data.
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
   * Performs DELETE request.
   * @param {string} endpoint - API endpoint path (without base URL).
   * @param {!Object=} options - Additional fetch options.
   * @param {?string=} token - Authentication token.
   * @return {!Promise<!Object>} API response data.
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

/**
 * Normalizes network and HTTP errors into a consistent Error instance.
 * @param {*} err - Raw error from fetch/axios layer.
 * @returns {Error} Normalized error with message and optional code.
 */
export function normalizeNetworkError(err) {
  const msg = String(err?.message || "");

  // Network-level issues
  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("Network Error") ||
    msg.includes("ERR_NETWORK") ||
    msg.includes("ECONNABORTED") ||
    msg.includes("timeout")
  ) {
    const e = new Error("No hay conexión con el servidor. Intenta más tarde.");
    e.code = "NETWORK_ERROR";
    return e;
  }

  // HTTP response errors (axios-style shape)
  const status = err?.response?.status;
  const serverMsg =
    err?.response?.data?.message || err?.response?.data?.error || err?.message;

  const e = new Error(serverMsg || "Ocurrió un error inesperado.");
  if (status) e.code = `HTTP_${status}`;
  return e;
}
