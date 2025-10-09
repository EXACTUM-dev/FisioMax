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
 * Actualiza un rol y sus privilegios
 * @param {string} id - ID del rol a actualizar
 * @param {string} name - Nuevo nombre del rol
 * @param {Array<string>} privileges - IDs de los privilegios seleccionados
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export const updateRole = async (id, name, privileges, token) => {
  return apiClient.post(
    `/roles/edit/${id}`,
    {
      name,
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
