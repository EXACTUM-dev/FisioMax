/**
 * @fileoverview Servicio para la gestión de roles en la aplicación
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import { apiClient } from "./api";

/**
 * Retrieves all available roles.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Array<!Role>>} List of role objects.
 */
export const getAllRoles = async (token) => {
  return apiClient.get("/roles", {}, token);
};

/**
 * Retrieves a specific role with its privileges.
 * @param {string} id - Role identifier to retrieve.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Role>} Role details with privileges.
 */
export const getRoleById = async (id, token) => {
  return apiClient.get(`/roles/edit/${id}`, {}, token);
};

/**
 * Updates a role with new name, description and privileges.
 * @param {string} id - Role identifier to update.
 * @param {string} name - New role name.
 * @param {string} description - New role description.
 * @param {!Array<string>} privileges - Array of selected privilege IDs.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Object>} Update operation result.
 */
export const updateRole = async (id, name, description, privileges, token) => {
  return apiClient.post(
    `/roles/edit/${id}`,
    {
      name,
      description,
      privileges,
    },
    {},
    token
  );
};

/**
 * Deletes a role (currently mocked - not implemented in backend).
 * @param {string} id - Role identifier to delete.
 * @param {string} token - Authentication token.
 * @return {!Promise<!Object>} Delete operation result.
 * @deprecated This function is not implemented in the backend yet.
 */
export const deleteRole = async (id, token) => {
  // Placeholder for implementation
  console.warn("La función deleteRole no está implementada en el backend");
  
  return Promise.resolve({ success: true, message: "Rol eliminado" });
};
