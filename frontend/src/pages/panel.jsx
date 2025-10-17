/**
 * @fileoverview Main control panel view component.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * Panel component - Main control panel view.
 * Manages the state and layout for the admin panel, including user and role management.
 * Fetches user and role data from the backend and displays them in switchable table views.
 * @returns {JSX.Element} Admin panel component with data tables and navigation.
 */

// Import necessary libraries and components
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import Carousel from "../organisms/carousel";
import DataSwitchContainer from "../organisms/dataSwitchContainer";

// Data and utilities
import buildUserRolesColumns from "../data/tableTemplates/userRolesColumns";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import { fetchWithClerk } from "../utils/api";

export default function Panel() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [current, setCurrent] = useState("panel");
  
    // State for UI data
    const [userRows, setUserRows] = useState([]); // Users from backend
    const [roleRows, setRoleRows] = useState([]); // Roles from backend
  
const [error, setError] = useState(null);

  // Fetch initial data for the panel
  useEffect(() => {
    let alive = true; // Prevent state updates after unmount
    async function fetchData() {
      try {
        const token = await getToken();
        const usersResponse = await fetchWithClerk("/api/usuarios", { method: "GET" }, token);
        if (!alive) return;
        // Extract user array from backend response
        setUserRows(Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || []);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("Error loading users. Please try again later.");
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
  }, [getToken]);

  // Fetch roles from the backend
  useEffect(() => {
    let alive = true; // Prevent state updates after unmount
    async function fetchData() {
      try {
        const token = await getToken();
        const rolesResponse = await fetchWithClerk('/api/roles', { method: 'GET' }, token);
        if (!alive) return;
        // Extract role array from backend response
        setRoleRows(Array.isArray(rolesResponse) ? rolesResponse : rolesResponse?.data || []);
      } catch (err) {
        console.error("Error loading roles:", err);
        setError("Error loading roles. Please try again later.");
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
  }, [getToken]);

  // Function to update a user's role
  const updateUserRole = useCallback(
    async (rowId, newRoleObj) => {
      const roleName = newRoleObj?.name || newRoleObj?.nombre || newRoleObj; // Extract role name
      const id = rowId?.id || rowId?.IDUsuario || rowId; // Extract user ID
      const prevRows = userRows; // Backup current state for rollback
      setUserRows((prev) =>
        prev.map((u) => (u.id === id || u.IDUsuario === id ? { ...u, rol: roleName } : u))
      );
      try {
        const token = await getToken();
        await fetchWithClerk(`/api/usuarios/${id}/rol`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rol: roleName }),
        }, token);
        console.log("Rol actualizado en backend:", roleName);
      } catch (err) {
        console.error("Error updating role in backend:", err);
        setUserRows(prevRows); // Revert UI changes on error
      }
    },
    [getToken, userRows]
  );

  // Map user rows to include role names from roleRows and full names
  const mappedUserRows = useMemo(() => {
    if (!Array.isArray(userRows)) {
      console.error("userRows no es un arreglo:", userRows);
      return [];
    }
    return userRows.map((user) => {
      const role = roleRows.find((r) => r.IDRol === user.roleId);
      // Build full name with nombres, apellidoP and apellidoM
      const nombreCompleto = `${user.nombres || ''} ${user.apellidoP || ''} ${user.apellidoM || ''}`.trim();
      return {
        ...user,
        nombre: nombreCompleto || user.nombre || user.name, // Prioritize built full name
        roleName: role ? role.nombre : "Sin rol asignado",
      };
    });
  }, [userRows, roleRows]); // Validate that userRows is an array before using map

  // Define columns for the user table
  const userColumns = useMemo(
    () =>
      buildUserRolesColumns({
        roles: roleRows,
        onDelete: (row) => setUserRows((prev) => prev.filter((r) => r.id !== row.id)),
        onChangeRole: (row, chosenRole) => updateUserRole(row.id || row.IDUsuario, chosenRole),
      }),
    [roleRows, updateUserRole]
  );

  // Define columns for the role table
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: () => {},
        onDelete: (row) =>
          setRoleRows((prev) => prev.filter((r) => r.id !== row.id)),
      }),
    []
  );

  useEffect(() => {
  }, [roleRows]);

  useEffect(() => {
  }, [userRows]);

  // Show loading spinner until user data is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header component with user info */}
      <AppHeader user={user} />

      {/* Sidebar navigation */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main content area */}
      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        {/* Data switcher for toggling between views */}
        <DataSwitchContainer
          initialKey="solicitudes"
          views={[
            {
              key: "solicitudes",
              label: "Solicitudes",
              type: "table",
              columns: roleColumns,
              rows: roleRows,
              searchPlaceholder: "Buscar Solicitudes...",
            },
            {
              key: "users",
              label: "Usuarios",
              type: "table",
              columns: userColumns,
              rows: mappedUserRows,
              searchPlaceholder: "Buscar Usuarios...",
            },
          ]}
        />
      </main>
    </div>
  );
}