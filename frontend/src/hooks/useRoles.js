/**
 * @fileoverview Hook to manage roles page logic
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import * as rolesService from "../services/rolesServices";

/**
 * Hook to manage roles and their privileges.
 * @returns {Object} - States and methods for working with roles
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
      const response = await rolesService.getAllRoles(token);
      setRoles(
        (response?.data ?? []).map((role) => ({
          id: role.IDRol || role.id,
          rol: role.nombre || role.name,
          permisos: role.descripcion || role.description,
        }))
      );
    } catch (err) {
      setError(err.message || "Error al cargar roles");
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
          throw new Error("No se pudo cargar el rol");
        }
      } catch (err) {
        setError(err.message || "Error al cargar el rol");
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
        throw err;
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

/**
 * Hook for role creation functionality
 * @returns {Object} Role creation methods and states
 */
export function useCreateRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createPrivileges, setCreatePrivileges] = useState([]);
  const { getToken } = useAuth();

  /**
   * Load privileges for role creation
   */
  const loadCreateRoleData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await rolesService.getCreateRoleData(token);

      if (response?.success && response?.data?.privileges) {
        setCreatePrivileges(response.data.privileges);
        return response.data.privileges;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.message || "Error cargando datos para crear rol");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Create a new role with privileges
   * @param {string} name - Role name
   * @param {string} description - Role description
   * @param {Array<string>} privilegeIds - Selected privilege IDs
   * @returns {Promise<Object>} Creation result
   */
  const createRoleWithPrivileges = useCallback(
    async (name, description, privilegeIds) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const result = await rolesService.createRole(
          name,
          description,
          privilegeIds,
          token
        );
        return result;
      } catch (err) {
        setError(err.message || "Error al crear el rol");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return {
    createPrivileges,
    loading,
    error,
    loadCreateRoleData,
    createRoleWithPrivileges,
  };
}
