/**
 * Version: 0.5.0
 * Hook para gestionar roles y privilegios
 * FIX: Ahora carga roles Y privilegios por separado
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
  const [allPrivileges, setAllPrivileges] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  /**
   * Carga todos los roles disponibles
   */
  const loadRoles = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();
      const response = await rolesService.getAllRoles(token);
      
      if (!response) {
        console.warn('Respuesta vacía del servidor');
        setRoles([]);
        return;
      }
      
      const rolesData = Array.isArray(response) ? response : response.data;
      
      if (!Array.isArray(rolesData)) {
        console.error('La respuesta no es un array:', rolesData);
        setRoles([]);
        return;
      }
      
      setRoles(
        rolesData.map((role) => ({
          id: role.IDRol || role.id,
          rol: role.nombre || role.rol,
          permisos: role.privilegiosText || role.descripcion || "",
          descripcion: role.descripcion || "",
          privileges: role.privileges || []
        }))
      );
    } catch (err) {
      const errorMessage = err.message || "Error al cargar roles";
      setError(errorMessage);
      console.error("Error cargando roles:", err);
      setRoles([]);
    }
  }, [getToken]);

  const loadAllPrivileges = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();
      const response = await rolesService.getAllPrivileges(token);
      
      if (!response) {
        setAllPrivileges([]);
        return;
      }
      
      const privilegesData = Array.isArray(response) ? response : response.data;
      console.log("Privilegios procesados:", privilegesData);
      
      if (!Array.isArray(privilegesData)) {
        console.error('La respuesta de privilegios no es un array:', privilegesData);
        setAllPrivileges([]);
        return;
      }
      
      setAllPrivileges(privilegesData);
      console.log("Privilegios cargados correctamente:", privilegesData.length);
    } catch (err) {
      console.error("Error cargando privilegios:", err);
      const errorMessage = err.message || "Error al cargar privilegios";
      setError(errorMessage);
      setAllPrivileges([]);
    }
  }, [getToken]);

  /**
   * Carga todos los datos (roles y privilegios)
   */
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRoles(),
        loadAllPrivileges()
      ]);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, [loadRoles, loadAllPrivileges]);

  /**
   * Carga un rol específico por ID con sus privilegios
   * @param {string} roleId - ID del rol a cargar
   * @returns {Promise} - Promesa con los datos del rol
   */
  const loadRoleById = useCallback(
    async (roleId) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await rolesService.getRoleById(roleId, token);
        
        if (!response) {
          throw new Error('Respuesta vacía del servidor');
        }
        
        const roleData = response.data || response;
        setSelectedRole(roleData);
        return roleData;
      } catch (err) {
        const errorMessage = err.message || "Error al cargar el rol";
        setError(errorMessage);
        console.error("Error cargando rol:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  /**
   * Elimina un rol
   * @param {string} roleId - ID del rol a eliminar
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
        const errorMessage = err.message || "Error al eliminar el rol";
        setError(errorMessage);
        console.error("Error eliminando rol:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    roles,
    allPrivileges,
    selectedRole,
    loading,
    error,
    loadRoles,
    loadAllPrivileges,
    loadAllData,
    loadRoleById,
    deleteRoleById,
    setSelectedRole,
  };
}