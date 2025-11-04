/**
 * @fileoverview Admin control panel for managing users and roles.
 * Provides data tables for user and role management with CRUD operations.
 * @version 1.2.0
 * @author EXACTUM-dev
 */

// Import necessary libraries and components
import React, {useEffect, useMemo, useState, useCallback} from "react";
import {useUser, useAuth} from "@clerk/clerk-react";
import {useNavigate} from "react-router-dom";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import Loading from "../atoms/loading";

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
export default function Panel() {
  const {user, isLoaded} = useUser();
  const {getToken} = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("bolt");
  
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

  // Fetch memberships list from data base
  const fetchMemberships = useCallback(async () => {
    try {
      const token = await getToken();
      const resp = await fetchWithClerk('/api/membership-applications', { method: 'GET' }, token);

      // backend may return { success, data } or an array
      const rows = Array.isArray(resp) ? resp : resp?.data || [];

      // Exclude already approved memberships: we only want Pendiente and Rechazado here
      const visibleRows = (rows || []).filter((r) => {
        const aceptado = typeof r.aceptado !== 'undefined' ? r.aceptado : (r.accepted ?? null);
        return aceptado !== 1; // keep if not approved
      });

      const mapped = (visibleRows || []).map((r) => ({
        id: r.IDMembresia ?? r.id ?? r.IDMembresia,
        aceptado: typeof r.aceptado !== 'undefined' ? r.aceptado : (r.accepted ?? null),
        estatusPago: typeof r.estatusPago !== 'undefined' ? r.estatusPago : (r.paymentStatus ?? null),
        IDUsuario: r.IDUsuario || r.userId || null,
        nombre: `${r.nombres || r.nombre || ''} ${r.apellidoP || ''} ${r.apellidoM || ''}`.trim() || 'Sin nombre',
        estado: (typeof r.aceptado !== 'undefined' ? (r.aceptado === 1 ? 'Aprobado' : r.aceptado === 0 ? 'Rechazado' : 'Pendiente') : (r.status || 'Pendiente')),
        fecha: r.createdAt || r.created_at || r.fecha || null,
        __raw: r,
      }));

      setMembershipRows(mapped);
    } catch (err) {
      console.error('Error de carga de solicitudes:', err);
      setError('Error de carga de solicitudes. Por favor intente más tarde.');
    }
  }, [getToken]);

  // Fetch detailed membership by id and open modal with full data.
  const fetchMembershipDetail = useCallback(async (id) => {
    try {
      const token = await getToken();
      const resp = await fetchWithClerk(`/api/membership-applications/${id}`, { method: 'GET' }, token);
      const detail = resp?.data ?? resp ?? null;

      if (detail) {
        setSelectedMembership(detail);
        setMembershipModalOpen(true);
        return;
      }
    } catch (err) {
      // If endpoint doesn't exist or fails, fall back to list entry
      console.warn('No se pudo obtener detalle de membresía:', err.message || err);
    }

    // fallback -> find in membershipRows
    const fallback = membershipRows.find((m) => String(m.id) === String(id));
    if (fallback) {
      setSelectedMembership(fallback.__raw ? { ...fallback.__raw } : fallback);
      setMembershipModalOpen(true);
    } else {
      setError('No se encontró la solicitud solicitada.');
    }
  }, [getToken, membershipRows]);

  // Fetch initial data for the panel
  useEffect(() => {
    let alive = true;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = await getToken();
        const usersResponse = await fetchWithClerk(
            '/api/users',
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
      } finally {
        if (alive) setLoadingUsers(false);
      }
    };
    fetchUsers();
    fetchMemberships();
    return () => {
      alive = false;
    };
  }, [getToken, fetchMemberships]);

  // Fetch roles from the backend
  useEffect(() => {
    let alive = true;

    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
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
  const handleUserNameClick = useCallback((userRow) => {
    // Navigate to user profile page with user ID
    const userId = userRow.IDUsuario || userRow.id;
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  }, [navigate]);

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
        onClickName: handleUserNameClick,
      }),
      [roleRows, updateUserRole, handleUserNameClick]
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
  // Define columns for memberships table
  const membershipColumns = useMemo(
    () => buildMembershipColumns({
      onView: (row) => {
        // Prefer explicit id fields from backend raw data, fall back to row.id
        const id = row?.id ?? row?.IDMembresia ?? row?.__raw?.IDMembresia ?? row?.__raw?.id;
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
            <Button
              variant="secondary"
              size="sm"
              radius="lg"
              onClick={() => navigate('/roles')}
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
                columns: membershipColumns,
                rows: membershipRows,
                searchPlaceholder: "Buscar Solicitudes...",
                filterColumn: "estado",
              filterOptions: ["Rechazado", "Pendiente"],
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
      {/* New modal for memberships*/}
    {selectedMembership && (
      <MembershipModal
        open={membershipModalOpen}
        onClose={() => {
          setMembershipModalOpen(false);
          setSelectedMembership(null);
          // refresh list after modal closes in case a status changed
          fetchMemberships();
        }}
        solicitud={selectedMembership}
        onStatusChange={(membershipId, newStatus) => {
          // Updated the initial state
          setMembershipRows(prev => 
            prev.map(membership => 
              membership.id === membershipId 
                ? { ...membership, estado: newStatus }
                : membership
            )
          );
        }}
      />
    )}
    </div>
  );
}