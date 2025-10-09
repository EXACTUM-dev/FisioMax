/**
 * Version: 0.3.0
 * Hook para gestionar roles y privilegios
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import * as rolesService from "../services/rolesServices";

/**
 * Hook para gestionar la lógica de roles
 * @returns {Object} - Estados y métodos para trabajar con roles
 */
export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  /**
   * Carga todos los roles disponibles
   */
  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await rolesService.getAllRoles(token);
      
      // El backend devuelve directamente el array
      const rolesData = Array.isArray(response) ? response : response.data;
      
      setRoles(
        rolesData.map((role) => ({
          id: role.IDRol || role.id,
          rol: role.nombre || role.rol,
          permisos: role.privilegiosText || role.descripcion,
          descripcion: role.descripcion,
          privileges: role.privileges || []
        }))
      );
    } catch (err) {
      setError(err.message || "Error al cargar roles");
      console.error("Error cargando roles:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Carga un rol específico por ID con sus privilegios
   * @param {string} roleId - ID del rol a cargar
   */
  const loadRoleById = useCallback(
    async (roleId) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await rolesService.getRoleById(roleId, token);
        setSelectedRole(response.data);
      } catch (err) {
        setError(err.message || "Error al cargar el rol");
        console.error("Error cargando rol:", err);
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  /**
   * Actualiza un rol y sus privilegios
   * @param {string} roleId - ID del rol
   * @param {string} name - Nuevo nombre del rol
   * @param {Array<string>} privileges - IDs de los privilegios seleccionados
   * @returns {Promise} - Promesa con el resultado
   */
  const updateRoleWithPrivileges = useCallback(
    async (roleId, name, privileges) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const result = await rolesService.updateRole(
          roleId,
          name,
          privileges,
          token
        );

        // Actualizar la lista de roles localmente
        await loadRoles();

        return result;
      } catch (err) {
        setError(err.message || "Error al actualizar el rol");
        console.error("Error actualizando rol:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken, loadRoles]
  );

  /**
   * Elimina un rol (función mockup para la UI)
   * @param {string} roleId - ID del rol a eliminar
   */
  const deleteRoleById = useCallback(
    async (roleId) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        await rolesService.deleteRole(roleId, token);

        // Actualizar la lista local eliminando el rol
        setRoles((prev) => prev.filter((role) => role.id !== roleId));
      } catch (err) {
        setError(err.message || "Error al eliminar el rol");
        console.error("Error eliminando rol:", err);
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    selectedRole,
    loading,
    error,
    loadRoles,
    loadRoleById,
    updateRoleWithPrivileges,
    deleteRoleById,
    setSelectedRole,
  };
}
