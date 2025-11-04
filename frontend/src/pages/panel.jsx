/**
 * @fileoverview Admin control panel for managing users and roles.
 * Provides data tables for user and role management with CRUD operations.
 * @version 1.1.0
 * @author EXACTUM-dev
 */

/**
 * Renders the main admin control panel with user and role management tables.
 * Fetches and displays user and role data from backend with switchable views.
 * @return {!React.Component} Admin panel component with data tables and navigation.
 */

// Import necessary libraries and components
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import Loading from "../atoms/loading";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import Modal from "../molecules/modal";
import ConfirmationModal from "../molecules/confirmationModal";

// Organisms
import Carousel from "../organisms/carousel";
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import DataTable from "../organisms/dataTable";

// Data and utilities
import buildUserRolesColumns from "../data/tableTemplates/userRolesColumns";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import { fetchWithClerk } from "../utils/api";

// Services (NEW): user delete service
import { deleteUser as deleteUserService } from "../services/usersServices";

export default function Panel() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("bolt");

  // State for UI data
  const [userRows, setUserRows] = useState([]); // Users from backend
  const [roleRows, setRoleRows] = useState([]); // Roles from backend
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Modal state for viewing role permissions
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState(null);
  const [rolePrivileges, setRolePrivileges] = useState([]);

  const [error, setError] = useState(null);

  // Confirmation modal state for user deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Success modal state for user deletion
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  /**
   * Normalizes and filters out deleted users for table rendering.
   * Keeps only non-deleted users (eliminado = 0/NULL and no deletedAt).
   * @param {Array<Object>} list raw list from API
   * @returns {Array<Object>} filtered list
   */
  const normalizeActiveUsers = useCallback((list) => {
    const arr = Array.isArray(list) ? list : [];
    return arr.filter(
      (u) => (u?.eliminado === 0 || u?.eliminado == null) && !u?.deletedAt
    );
  }, []);

  // Fetch initial data for the panel
  useEffect(() => {
    let alive = true;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = await getToken();
        const usersResponse = await fetchWithClerk(
          "/api/users",
          { method: "GET" },
          token
        );
        if (!alive) return;

        // Extract payload from backend, then filter-out deleted
        const raw = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse?.data || [];
        setUserRows(normalizeActiveUsers(raw));
      } catch (err) {
        console.error("Error de carga de usuarios:", err);
        setError("Error de carga de usuarios. Por favor intente más tarde.");
      } finally {
        if (alive) setLoadingUsers(false);
      }
    };

    fetchUsers();
    return () => {
      alive = false;
    };
  }, [getToken, normalizeActiveUsers]);

  // Fetch roles from the backend
  useEffect(() => {
    let alive = true;

    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const token = await getToken();
        const rolesResponse = await fetchWithClerk(
          "/api/roles",
          { method: "GET" },
          token
        );
        if (!alive) return;
        // Extract role array from backend response
        const extractedRoles = Array.isArray(rolesResponse)
          ? rolesResponse
          : rolesResponse?.data || [];
        setRoleRows(extractedRoles);
      } catch (err) {
        console.error("Error de carga de roles:", err);
        setError("Error de carga de roles. Por favor intente más tarde.");
      } finally {
        if (alive) setLoadingRoles(false);
      }
    };

    fetchRoles();
    return () => {
      alive = false;
    };
  }, [getToken]);

  /**
   * Handles clicking on a user name to view their profile.
   * @param {Object} userRow User object from table row
   */
  const handleUserNameClick = useCallback(
    (userRow) => {
      // Navigate to user profile page with user ID
      const userId = userRow.IDUsuario || userRow.id;
      if (userId) {
        navigate(`/profile/${userId}`);
      }
    },
    [navigate]
  );

  /**
   * Updates user's role in the UI state.
   * @param {string|number} userId User identifier
   * @param {Object} newRoleObj Role object containing role information
   */
  const updateUserRole = useCallback((userId, newRoleObj) => {
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
  }, []);

  /**
   * Handles viewing role details with privileges.
   * @param {Object} roleRow Role object from table row
   */
  const handleViewRole = useCallback(
    async (roleRow) => {
      try {
        const token = await getToken();
        const response = await fetchWithClerk(
          `/api/roles/${roleRow.id}`,
          { method: "GET" },
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
        console.error("Error loading role details:", err);
      }
    },
    [getToken]
  );

  const mappedUserRows = useMemo(() => {
    if (!Array.isArray(userRows)) {
      console.warn("userRows is not an array:", userRows);
      return [];
    }

    console.log("Current user clerkID:", user?.id);
    console.log("Original userRows:", userRows);

    return userRows
      .filter((userRow) => userRow.clerkID !== user?.id) // Exclude only the current user
      .map((user) => {
        const nombreCompleto = `${user.nombres || ""} ${user.apellidoP || ""} ${
          user.apellidoM || ""
        }`.trim();

        const roleName =
          user.rol ||
          user.rolNombre ||
          roleRows.find((r) => r.IDRol === user.IDRol)?.nombre ||
          "Sin rol asignado";

        return {
          // keep original payload
          ...user,

          // normalized display name
          nombre: nombreCompleto || user.nombre || user.name,

          // normalized role name
          rol: roleName,
          roleName: roleName,
          rolNombre: user.rolNombre ?? roleName,

          // normalized primary key for table actions (force id to be the backend PK)
          /**
           * Ensures action handlers (edit/delete) receive the real backend PK.
           * Many table builders rely on `row.id`, so force it to be IDUsuario.
           */
          id: user.IDUsuario ?? user.id,
        };
      });
  }, [userRows, roleRows, user]);

  // Define columns for the user table
  const userColumns = useMemo(
    () =>
      buildUserRolesColumns({
        roles: roleRows,
        /**
         * Deletes a user (soft-delete) and removes the row from UI.
         * Calls API with Clerk token and performs optimistic update.
         * @param {Object} row user row data object
         */
        onDelete: async (row) => {
          try {
            const idRaw = row?.IDUsuario ?? row?.id;
            if (!idRaw) {
              console.warn("Missing user id in row:", row);
              alert("No se pudo determinar el ID del usuario.");
              return;
            }

            // Ensure numeric id to avoid deleting wrong records
            const id = Number(idRaw);
            if (Number.isNaN(id)) {
              console.warn("Invalid user id value:", idRaw, row);
              alert("ID de usuario inválido.");
              return;
            }

            // Open confirmation modal
            setUserToDelete(row);
            setDeleteConfirmOpen(true);
          } catch (err) {
            console.error("Error al preparar eliminación de usuario:", err);
            alert(err?.message || "No se pudo preparar la eliminación del usuario.");
          }
        },
        onChangeRole: (row, chosenRole) =>
          updateUserRole(row.id || row.IDUsuario, chosenRole),
        onClickName: handleUserNameClick,
      }),
    [roleRows, updateUserRole, handleUserNameClick, getToken]
  );

  // Define columns for the role table with view action
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: handleViewRole,
        editLabel: "Ver Permisos",
        editTooltip: "Ver detalles",
        showDelete: false,
      }),
    [handleViewRole]
  );

  // Show loading spinner until user data is loaded
  if (!isLoaded) {
    return <Loading fullscreen message="Cargando..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header component with user info */}
      <AppHeader user={user} />

      {/* Sidebar navigation */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main content area */}
      <main className="p-4 space-y-8 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-[1100px] mx-auto">
          <Title2 className="mb-12">Panel de Control</Title2>
          
          <div className="flex justify-between mb-6">
            <Button
              variant="brand"
              size="sm"
              radius="lg"
              onClick={() => navigate('/uploadMultimedia')}
            >
              Subir Contenido
            </Button>
          <Title2 className="mb-4">Panel de Control</Title2>

          <div className="flex justify-end mb-6">
            <Button
              variant="secondary"
              size="sm"
              radius="lg"
              onClick={() => navigate("/roles")}
            >
              Roles
            </Button>
          </div>

          {/* Data switcher for toggling between views */}
          <DataSwitchContainer
            initialKey="solicitudes"
            loading={loadingRoles || loadingUsers}
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
        </div>
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
                    {selectedRoleForView.description || "Sin descripción"}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical divider - Desktop only */}
            <div className="hidden lg:block w-px bg-slate-200 mx-2" />

            {/* Right column - Privileges list (no checkboxes) */}
            <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
              <div
                className="bg-white rounded-lg border border-slate-200 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto p-2 sm:p-3
                [&::-webkit-scrollbar]:w-2 sm:[&::-webkit-scrollbar]:w-3
                [&::-webkit-scrollbar-track]:bg-slate-100
                [&::-webkit-scrollbar-track]:rounded-lg
                [&::-webkit-scrollbar-thumb]:bg-slate-300
                [&::-webkit-scrollbar-thumb]:rounded-lg
                [&::-webkit-scrollbar-thumb]:hover:bg-slate-400"
              >
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
                  Total de permisos:{" "}
                  <span className="font-semibold">{rolePrivileges.length}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation modal for user deletion */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro de que deseas eliminar al usuario "${[userToDelete?.nombres, userToDelete?.apellidoP, userToDelete?.apellidoM].filter(Boolean).join(" ")}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          try {
            const token = await getToken();
            await deleteUserService(userToDelete?.IDUsuario ?? userToDelete?.id, token);

            // Optimistic UI update
            setUserRows((prev) => prev.filter((r) => (r?.IDUsuario ?? r?.id) !== userToDelete?.IDUsuario));
            setDeleteConfirmOpen(false);

            // Show success modal
            setSuccessModalOpen(true);
          } catch (err) {
            console.error("Error al eliminar usuario:", err);
            alert(err?.message || "No se pudo eliminar el usuario.");
          }
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Success modal for user deletion */}
      <Modal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        size="md"
        className="p-6"
      >
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Title2 className="mb-4">¡Usuario Eliminado!</Title2>
          <p className="text-lg">
            El usuario "{userToDelete?.nombres} {userToDelete?.apellidoP}" ha sido eliminado con éxito.
          </p>
          <Button
            label="Entendido"
            variant="brand"
            onClick={() => setSuccessModalOpen(false)}
            className="mt-6"
          />
        </div>
      </Modal>
    </div>
  );
}
