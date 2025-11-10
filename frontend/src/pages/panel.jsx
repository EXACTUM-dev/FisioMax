/**
 * @fileoverview Admin control panel for managing users and roles.
 * Provides data tables for user and role management with CRUD operations.
 * @version 0.3.0
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
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import Modal from "../molecules/modal";
import ConfirmationModal from "../molecules/confirmationModal";

// Organisms
import Carousel from "../organisms/carousel";
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import DataTable from "../organisms/dataTable";
import buildUserRolesColumns from "../data/tableTemplates/userRolesColumns";
import buildMembershipColumns from "../data/tableTemplates/membershipColumns";
import { fetchWithClerk } from "../utils/api";
import MembershipModal from "../data/modalTemplates/membershipModal";

/**
 * Panel Component
 * @description Main administrative control panel view that manages users, roles, and membership requests.
 * Fetches data from the backend using Clerk authentication and displays it in switchable, responsive table views.
 * Handles user role updates, membership status changes, and role permission viewing through modals.
 * @returns {JSX.Element} Admin panel interface with navigation, data tables, and management modals.
 */
// Services (NEW): user delete service
import { deleteUser as deleteUserService } from "../services/usersServices";

export default function Panel() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("bolt");
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [searchQuery, setSearchQuery] = useState("");

  // State for UI data
  const [userRows, setUserRows] = useState([]); // Users from backend
  const [roleRows, setRoleRows] = useState([]); // Roles from backend
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [membershipRows, setMembershipRows] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);

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

  // Error modal state for user deletion
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Fetch memberships list from data base
  const fetchMemberships = useCallback(async () => {
    try {
      const token = await getToken();
      const resp = await fetchWithClerk(
        "/api/membership-applications",
        { method: "GET" },
        token
      );

      // backend may return { success, data } or an array
      const rows = Array.isArray(resp) ? resp : resp?.data || [];

      // Exclude already approved memberships: we only want Pendiente and Rechazado here
      const visibleRows = (rows || []).filter((r) => {
        const aceptado =
          typeof r.aceptado !== "undefined" ? r.aceptado : r.accepted ?? null;
        return aceptado !== 1; // keep if not approved
      });

      const mapped = (visibleRows || []).map((r) => ({
        id: r.IDMembresia ?? r.id ?? r.IDMembresia,
        aceptado:
          typeof r.aceptado !== "undefined" ? r.aceptado : r.accepted ?? null,
        estatusPago:
          typeof r.estatusPago !== "undefined"
            ? r.estatusPago
            : r.paymentStatus ?? null,
        IDUsuario: r.IDUsuario || r.userId || null,
        nombre:
          `${r.nombres || r.nombre || ""} ${r.apellidoP || ""} ${
            r.apellidoM || ""
          }`.trim() || "Sin nombre",
        estado:
          typeof r.aceptado !== "undefined"
            ? r.aceptado === 1
              ? "Aprobado"
              : r.aceptado === 0
              ? "Rechazado"
              : "Pendiente"
            : r.status || "Pendiente",
        fecha: r.createdAt || r.created_at || r.fecha || null,
        __raw: r,
      }));

      setMembershipRows(mapped);
    } catch (err) {
      console.error("Error de carga de solicitudes:", err);
      setError("Error de carga de solicitudes. Por favor intente más tarde.");
      console.error("Error de carga de solicitudes:", err);
      setError("Error de carga de solicitudes. Por favor intente más tarde.");
    }
  }, [getToken]);

  // Fetch detailed membership by id and open modal with full data.
  const fetchMembershipDetail = useCallback(
    async (id) => {
      try {
        const token = await getToken();
        const resp = await fetchWithClerk(
          `/api/membership-applications/${id}`,
          { method: "GET" },
          token
        );
        const detail = resp?.data ?? resp ?? null;

        if (detail) {
          setSelectedMembership(detail);
          setMembershipModalOpen(true);
          return;
        }
      } catch (err) {
        // If endpoint doesn't exist or fails, fall back to list entry
        console.warn(
          "No se pudo obtener detalle de membresía:",
          err.message || err
        );
      }
      if (detail) {
        setSelectedMembership(detail);
        setMembershipModalOpen(true);
        return;
      }

      // fallback -> find in membershipRows
      const fallback = membershipRows.find((m) => String(m.id) === String(id));
      if (fallback) {
        setSelectedMembership(
          fallback.__raw ? { ...fallback.__raw } : fallback
        );
        setMembershipModalOpen(true);
      } else {
        setError("No se encontró la solicitud solicitada.");
      }
    },
    [getToken, membershipRows]
  );

  // Fetch users list from database
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const token = await getToken();
      const usersResponse = await fetchWithClerk(
        "/api/users",
        { method: "GET" },
        token
      );

      // Extract payload from backend, then filter-out deleted
      const raw = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse?.data || [];

      const activeUsers = normalizeActiveUsers(raw);

      setUserRows(activeUsers);
    } catch (err) {
      setError("Error de carga de usuarios. Por favor intente más tarde.");
    } finally {
      setLoadingUsers(false);
    }
  }, [getToken, normalizeActiveUsers]);

  // Fetch initial data for the panel
  useEffect(() => {
    fetchUsers();
    fetchMemberships();
  }, [fetchUsers, fetchMemberships]);

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
        console.error("Error al cargar roles:", err);
        setError("Error al cargar roles. Por favor intente más tarde.");
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
          `/roles/${roleRow.id}`,
          { method: "GET" },
          token
        );

        if (response?.success && response.data) {
          const roleData = response.data;

          // Map privileges to table format (without checkboxes, just for display)
          const mappedPrivileges = (roleData.privileges ?? []).map(
            (p, index) => ({
              id: p.id,
              label: p.name,
              sequenceNumber: index + 1,
            })
          );

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

    return userRows
      .filter((userRow) => userRow.clerkID !== user?.id) // Exclude only the current user
      .map((user) => {
        const nombreCompleto = `${user.nombres || ""} ${user.apellidoP || ""} ${
          user.apellidoM || ""
        }`.trim();

        ("Sin rol asignado");
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
            alert(
              err?.message || "No se pudo preparar la eliminación del usuario."
            );
            alert(
              err?.message || "No se pudo preparar la eliminación del usuario."
            );
          }
        },
        onChangeRole: (row, chosenRole) =>
          updateUserRole(row.id || row.IDUsuario, chosenRole),
      }),
    [roleRows, updateUserRole, getToken]
  );

  // Define columns for the role table with view action
  const roleColumns = useMemo(
    () =>
      buildUserRolesColumns({
        onEdit: handleViewRole,
        editLabel: "Ver Permisos",
        editTooltip: "Ver detalles",
        showDelete: false,
      }),
    [handleViewRole]
  );
  // Define columns for memberships table
  const membershipColumns = useMemo(
    () =>
      buildMembershipColumns({
        onView: (row) => {
          // Prefer explicit id fields from backend raw data, fall back to row.id
          const id =
            row?.id ??
            row?.IDMembresia ??
            row?.__raw?.IDMembresia ??
            row?.__raw?.id;
          if (id) {
            fetchMembershipDetail(id);
          } else {
            // If no id available, open modal with provided row
            setSelectedMembership(row);
            setMembershipModalOpen(true);
          }
        },
      }),
    [fetchMembershipDetail]
  );

  // Show loading spinner until user data is loaded
  if (!isLoaded) {
    return <Loading fullscreen message="Cargando..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header component with user info */}
      <AppHeader user={user} showSearch={false} />

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
              onClick={() => navigate("/uploadMultimedia")}
            >
              Subir Contenido
            </Button>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                radius="lg"
                onClick={() => navigate("/solicitud-membresia")}
              >
                Registrar Usuario
              </Button>

              <Button
                variant="secondary"
                size="sm"
                radius="lg"
                onClick={() => navigate("/roles")}
              >
                Roles
              </Button>
            </div>
          </div>

          {/* Data switcher for toggling between views */}
          <DataSwitchContainer
            activeKey={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            loading={loadingRoles || loadingUsers}
            views={[
              {
                key: "solicitudes",
                label: "Solicitudes",
                type: "table",
                columns: membershipColumns,
                rows: membershipRows,
                searchPlaceholder: "Buscar Solicitudes...",
              },
              {
                key: "users",
                label: "Usuarios",
                type: "table",
                columns: userColumns,
                rows: mappedUserRows,
                onRowClick: handleUserNameClick,
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
      {/* New modal for memberships*/}
      {selectedMembership && (
        <MembershipModal
          open={membershipModalOpen}
          onClose={() => {
            setMembershipModalOpen(false);
            setSelectedMembership(null);
            // refresh list after modal closes in case a status changed
            fetchMemberships();
            fetchUsers(); // Refresh users list in case a membership was approved
          }}
          solicitud={selectedMembership}
          onStatusChange={(membershipId, newStatus) => {
            // Update the initial state
            setMembershipRows((prev) =>
              prev.map((membership) =>
                membership.id === membershipId
                  ? { ...membership, estado: newStatus }
                  : membership
              )
            );
            // If membership was approved, refresh users list
            if (newStatus === "Aprobado") {
              fetchUsers();
            }
          }}
        />
      )}

      {/* Confirmation modal for user deletion */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro de que deseas eliminar al usuario "${[
          userToDelete?.nombres,
          userToDelete?.apellidoP,
          userToDelete?.apellidoM,
        ]
          .filter(Boolean)
          .join(" ")}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          try {
            const token = await getToken();
            await deleteUserService(
              userToDelete?.IDUsuario ?? userToDelete?.id,
              token
            );

            // Optimistic UI update
            setUserRows((prev) =>
              prev.filter(
                (r) => (r?.IDUsuario ?? r?.id) !== userToDelete?.IDUsuario
              )
            );
            setDeleteConfirmOpen(false);

            // Show success modal
            setSuccessModalOpen(true);
          } catch (err) {
            console.error("Error al eliminar usuario:", err);
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
              className="h-16 w-16 text-green-500"
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
            El usuario "{userToDelete?.nombres} {userToDelete?.apellidoP}" ha
            sido eliminado con éxito.
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
