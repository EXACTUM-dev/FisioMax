/**
 * @fileoverview Servicio para la gestión de roles en la aplicación
 * @author EXACTUM-dev
 * @version 0.2.0
 */

import { apiClient } from "./api";
import { normalizeNetworkError } from "./api";

/**
 * Retrieves all available roles.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Array<!Role>>} List of role objects.
 */
export async function getAllRoles(token) {
  try {
    return await apiClient.get("/roles", {}, token);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}

/**
 * Retrieves a specific role with its privileges.
 * @param {string} id - Role identifier to retrieve.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Role>} Role details with privileges.
 */
export async function getRoleById(id, token) {
  try {
    return await apiClient.get(`/roles/edit/${id}`, {}, token);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}

/**
 * Updates a role with new name, description and privileges.
 * @param {string} id - Role identifier to update.
 * @param {string} name - New role name.
 * @param {string} description - New role description.
 * @param {!Array<string>} privileges - Array of selected privilege IDs.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Object>} Update operation result.
 */
export async function updateRole(id, name, description, privileges, token) {
  try {
    return await apiClient.post(
      `/roles/edit/${id}`,
      { name, description, privileges },
      {},
      token
    );
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}

/**
 * Get privileges data for role creation
 * @param {string} token - Authentication token
 * @return {Promise<Object>} Privileges list for create role form
 */
export const getCreateRoleData = async (token) => {
  try {
    return await apiClient.get("/roles/create", {}, token);
  } catch (err) {
    // Network error handling
    if (
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("NetworkError") ||
      err.message?.includes("Network Error")
    ) {
      const error = new Error(
        "No hay conexión con el servidor. Intenta más tarde."
      );
      error.code = "NETWORK_ERROR";
      throw error;
    }
    throw err;
  }
};

/**
 * Creates a new role with privileges
 * @param {string} name - Role name
 * @param {string} description - Role description
 * @param {Array<string>} privileges - Array of privilege IDs
 * @param {string} token - Authentication token
 * @return {Promise<Object>} Create operation result
 */
export async function createRole(name, description, privileges, token) {
  try {
    return await apiClient.post(
      "/roles/create",
      { name, description, privileges },
      {},
      token
    );
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}
/**
 * Deletes a role using backend API (logical delete on server).
 * @param {string} id - Role identifier to delete.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Object>} Delete operation result.
 */
export async function deleteRole(id, token) {
  try {
    return await apiClient.delete(`/roles/${id}`, {}, token);
  } catch (err) {
    throw normalizeNetworkError(err);
  }
}
