/**
 * Version: 0.4.0
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
   * Load all roles
   */
  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await rolesService.getAllRoles(token); // { success, data: [ ... ] }
      setRoles(
        (response?.data ?? []).map((role) => ({
          id: role.IDRol || role.id,
          rol: role.nombre || role.name,
          permisos: role.descripcion || role.description,
        }))
      );
    } catch (err) {
      setError(err.message || "Error al cargar roles");
      console.error("Error cargando roles:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Load a role by ID (returns the role object as API format)
   * Returns: { id, name, description, privileges: [{id,name,checked}] }
   */
  const loadRoleById = useCallback(
    async (roleId) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await rolesService.getRoleById(roleId, token); // { success, data: {...} }

        if (response && response.success && response.data) {
          setSelectedRole(response.data);
          return response.data; // Return the role object directly
        } else {
          console.error("Respuesta inválida:", response);
          throw new Error("No se pudo cargar el rol");
        }
      } catch (err) {
        setError(err.message || "Error al cargar el rol");
        console.error("Error cargando rol:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  /**
   * Update role with its name, description and privileges
   * @param {string} roleId - Role ID
   * @param {string} name - Role name
   * @param {string} description - Role description
   * @param {Array<string>} privileges - Array of privilege IDs
   * @returns {Promise<Object>} - Update result
   */
  const updateRoleWithPrivileges = useCallback(
    async (roleId, name, description, privileges) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const result = await rolesService.updateRole(
          roleId,
          name,
          description,
          privileges,
          token
        );

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
   * Delete role (UI placeholder)
   */
  const deleteRoleById = useCallback(
    async (roleId) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        await rolesService.deleteRole(roleId, token);
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
