/**
 * @fileoverview Vista para el panel de control.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

/**
 * Main control panel view.
 * This component manages the state and layout for the admin panel,
 * including user and role management.
 */

// Import necessary libraries and components
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

// Import custom components and utilities
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";

// Data y utils
import {
  userFormFields,
  getHeroSlides,
  getRowSlides,
  getProducts,
  getUsers,
  getRoles,
  getSolicitudes,
  getSideSlides,
} from "../data/mockApi";
import buildUserRolesColumns from "../data/tableTemplates/userRolesColumns";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import buildSolicitudesColumns from "../data/tableTemplates/solicitudesColumns";
import buildUsuariosTableColumns from "../data/tableTemplates/usuariosTableColumns";
import { fetchWithClerk } from "../utils/api";

export default function Panel() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [current, setCurrent] = useState("panel");

  // Estados para datos mostrados en la UI
  const [heroSlides, setHeroSlides] = useState([]);
  const [rowSlides, setRowSlides] = useState([]);
  const [userRows, setUserRows] = useState([]);
  const [roleRows, setRoleRows] = useState([]);
  const [solicitudRows, setSolicitudRows] = useState([]);
  const [, /* sideSlides no visible en UI */ setSideSlides] = useState([]);
  const [, /* products no visibles en Dashboard actual */ setProducts] =
    useState({ columns: [], rows: [] });
  
  const [error, setError] = useState(null);

  // Fetch initial data for the panel
  useEffect(() => {
    let alive = true;
    async function fetchData() {
      try {
        const [hero, row, prod, users, roles, solicitudes, side] = await Promise.all([
          getHeroSlides(),
          getRowSlides(),
          getProducts(),
          getUsers(),
          getRoles(),
          getSolicitudes(),
          getSideSlides(),
        ]);
        if (!alive) return;
        setHeroSlides(hero);
        setRowSlides(row);
        setProducts(prod);
        setUserRows(users);
        setRoleRows(roles);
        setSolicitudRows(solicitudes);
        setSideSlides(side);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar datos. Por favor, inténtalo más tarde.");
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
  }, []);

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

  const solicitudColumns = useMemo(
      () =>
        buildSolicitudesColumns({
          onOpenDocument: (doc) => {
            if (doc?.url) window.open(doc.url, "_blank", "noopener,noreferrer");
          },
          onAccept: (row) => {
            console.log("Aceptar solicitud:", row);
            // Aquí se puede agregar lógica para aceptar la solicitud
            setSolicitudRows((prev) => prev.filter((r) => r.id !== row.id));
          },
          onDelete: (row) =>
            setSolicitudRows((prev) => prev.filter((r) => r.id !== row.id)),
        }),
      []
    );

  const usuariosTableColumns = useMemo(
    () =>
      buildUsuariosTableColumns({
        onDelete: (row) =>
          setUserRows((prev) => prev.filter((r) => r.id !== row.id)),
      }),
    []
  );

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
              columns: userColumns,
              rows: userRows,
              searchPlaceholder: "Buscar Solicitudes...",
            },
            {
              key: "users",
              label: "Usuarios",
              type: "table",
              columns: usuariosTableColumns,
              rows: userRows,
              searchPlaceholder: "Buscar Usuarios...",
            },
          ]}
        />

        {/* Footer with additional actions */}
        <div className="max-w-[70rem] mx-auto">
          <div className="flex justify-center py-6">
            <Button size="sm" label="SOMEFIPP" />
          </div>
        </div>
      </main>
    </div>
  );
}