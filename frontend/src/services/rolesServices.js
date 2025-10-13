/**
 * Version: 0.3.0
 * Servicio para la gestión de roles en la aplicación
 */

import { apiClient } from "./api";

/**
 * Obtiene todos los roles disponibles
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} - Lista de roles
 */
export const getAllRoles = async (token) => {
  return apiClient.get("/roles", {}, token);
};

/**
 * Obtiene un rol específico con sus privilegios
 * @param {string} id - ID del rol a obtener
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Detalles del rol y sus privilegios
 */
export const getRoleById = async (id, token) => {
  return apiClient.get(`/roles/edit/${id}`, {}, token);
};

/**
 * Update a role with its name, description and privileges
 * @param {string} id - Role ID to update
 * @param {string} name - New role name
 * @param {string} description - New role description
 * @param {Array<string>} privileges - Array of selected privilege IDs
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Update operation result
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
 * Elimina un rol (no implementado en el backend, solo mock)
 * @param {string} id - ID del rol a eliminar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
export const deleteRole = async (id, token) => {
  // Esta función es un placeholder para una futura implementación
  console.warn("La función deleteRole no está implementada en el backend");
  // Simular respuesta exitosa por ahora
  return Promise.resolve({ success: true, message: "Rol eliminado" });
};
