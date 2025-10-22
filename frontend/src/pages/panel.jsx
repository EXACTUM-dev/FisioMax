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
import Modal from "../molecules/modal";

// Organisms
import Carousel from "../organisms/carousel";
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import DataTable from "../organisms/dataTable";

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
  
  // Modal state for viewing role permissions
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState(null);
  const [rolePrivileges, setRolePrivileges] = useState([]);
  
  const [error, setError] = useState(null);

  // Fetch initial data for the panel
  useEffect(() => {
    let alive = true;

    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const usersResponse = await fetchWithClerk(
            '/api/usuarios',
            {method: 'GET'},
            token
        );
        if (!alive) return;

        setUserRows(
            Array.isArray(usersResponse) ?
            usersResponse :
            usersResponse?.data || []
        );
      } catch (err) {
        console.error('Error de carga de usuarios:', err);
        setError('Error de carga de usuarios. Por favor intente más tarde.');
      }
    };

    fetchUsers();
    return () => {
      alive = false;
    };
  }, [getToken]);

  // Fetch roles from the backend
  useEffect(() => {
    let alive = true;

    const fetchRoles = async () => {
      try {
        const token = await getToken();
        const rolesResponse = await fetchWithClerk(
            '/api/roles',
            {method: 'GET'},
            token
        );
        if (!alive) return;
        // Extract role array from backend response
        const extractedRoles = Array.isArray(rolesResponse) ? rolesResponse : rolesResponse?.data || [];
        setRoleRows(extractedRoles);
      } catch (err) {
        console.error('Error de carga de roles:', err);
        setError('Error de carga de roles. Por favor intente más tarde.');
      }
    };

    fetchRoles();
    return () => {
      alive = false;
    };
  }, [getToken]);

  /**
   * Updates user's role in the UI state.
   * @param {string|number} userId User identifier
   * @param {Object} newRoleObj Role object containing role information
   */
  const updateUserRole = useCallback(
    (userId, newRoleObj) => {
      const roleName = newRoleObj?.name || newRoleObj?.nombre || newRoleObj;
      const roleId = newRoleObj?.id || newRoleObj?.IDRol;

      setUserRows((prev) =>
        prev.map((user) => {
          const matchesId = user.id === userId || user.IDUsuario === userId;
          if (matchesId) {
            return {
              ...user,
              rol: roleName,
              rolNombre: roleName,
              roleName: roleName,
              IDRol: roleId,
            };
          }
          return user;
        })
      );
    },
    []
  );

  /**
   * Handles viewing role details with privileges.
   * @param {Object} roleRow Role object from table row
   */
  const handleViewRole = useCallback(async (roleRow) => {
    try {
      const token = await getToken();
      const response = await fetchWithClerk(
          `/api/roles/${roleRow.id}`,
          {method: 'GET'},
          token
      );

      if (response?.success && response.data) {
        const roleData = response.data;
        
        // Map privileges to table format (without checkboxes, just for display)
        const mappedPrivileges = (roleData.privileges ?? []).map((p, index) => ({
          id: p.id,
          label: p.name,
          sequenceNumber: index + 1,
        }));

        setSelectedRoleForView(roleData);
        setRolePrivileges(mappedPrivileges);
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading role details:', err);
    }
  }, [getToken]);

  const mappedUserRows = useMemo(() => {
    if (!Array.isArray(userRows)) {
      return [];
    }

    return userRows.map((user) => {
      const nombreCompleto = `${user.nombres || ''} ${user.apellidoP || ''} ${user.apellidoM || ''}`.trim();

      const roleName = user.rol ||
                      user.rolNombre ||
                      (roleRows.find((r) => r.IDRol === user.IDRol)?.nombre) ||
                      'Sin rol asignado';

      return {
        ...user,
        nombre: nombreCompleto || user.nombre || user.name,
        rol: roleName,
        roleName: roleName,
      };
    });
  }, [userRows, roleRows]);

  // Define columns for the user table
  const userColumns = useMemo(
      () => buildUserRolesColumns({
        roles: roleRows,
        onDelete: (row) => setUserRows(
            (prev) => prev.filter((r) => r.id !== row.id)
        ),
        onChangeRole: (row, chosenRole) => updateUserRole(
            row.id || row.IDUsuario,
            chosenRole
        ),
      }),
      [roleRows, updateUserRole]
  );

  // Define columns for the role table with view action
  const roleColumns = useMemo(
      () => buildRolePermissionsColumns({
        onEdit: handleViewRole,
        editLabel: 'Ver Permisos',
        editTooltip: 'Ver detalles',
        showDelete: false,
      }),
      [handleViewRole]
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

      {/* Modal for viewing role permissions (read-only) */}
      {selectedRoleForView && (
        <Modal 
          open={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setSelectedRoleForView(null);
            setRolePrivileges([]);
          }} 
          size="xl"
        >
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
            {/* Left column - Role info */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex flex-col items-center justify-center h-full">
                <Title2 className="mb-4 sm:mb-6 lg:mb-8 text-lg sm:text-xl lg:text-2xl text-center">
                  Detalles del Rol
                </Title2>

                {/* Role name (read-only) */}
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Rol
                  </label>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                    {selectedRoleForView.name}
                  </div>
                </div>

                {/* Role description (read-only) */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción del Rol
                  </label>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 min-h-[60px]">
                    {selectedRoleForView.description || 'Sin descripción'}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical divider - Desktop only */}
            <div className="hidden lg:block w-px bg-slate-200 mx-2" />

            {/* Right column - Privileges list (no checkboxes) */}
            <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
              <div className="bg-white rounded-lg border border-slate-200 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto p-2 sm:p-3
                [&::-webkit-scrollbar]:w-2 sm:[&::-webkit-scrollbar]:w-3
                [&::-webkit-scrollbar-track]:bg-slate-100
                [&::-webkit-scrollbar-track]:rounded-lg
                [&::-webkit-scrollbar-thumb]:bg-slate-300
                [&::-webkit-scrollbar-thumb]:rounded-lg
                [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
                
                {/* Mobile header for table section */}
                <div className="lg:hidden mb-3 pb-2 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-700 text-center">
                    Lista de Permisos
                  </h3>
                </div>
                
                {/* Privileges data table (read-only, no checkboxes) */}
                <DataTable 
                  columns={[
                    {
                      key: "sequenceNumber",
                      label: "ID",
                      headAlign: "left",
                      align: "left",
                      className: "w-[20%]",
                      render: (row) => (
                        <span className="text-sm text-slate-600">
                          {row.sequenceNumber}
                        </span>
                      ),
                    },
                    {
                      key: "label",
                      label: "Permiso",
                      headAlign: "left",
                      align: "left",
                      className: "w-[80%]",
                      render: (row) => (
                        <span className="text-sm sm:text-base break-words">
                          {row.label}
                        </span>
                      ),
                    },
                  ]}
                  data={rolePrivileges}
                  className="text-xs sm:text-sm"
                />
              </div>
              
              {/* Total privileges count */}
              {rolePrivileges.length > 0 && (
                <div className="mt-3 text-center text-sm text-slate-600">
                  Total de permisos: <span className="font-semibold">{rolePrivileges.length}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}