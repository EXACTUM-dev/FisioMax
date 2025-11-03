/**
 * @fileoverview Role management page: list, edit and create roles
 * @author EXACTUM-dev
 * @version 0.5.0
 */

import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Atoms
import Loading from "../atoms/loading";
import AlertBanner from "../atoms/alertBanner";
import {Title2} from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import Button from "../atoms/button";
import ConfirmationModal from "../molecules/confirmationModal";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import ChecklistModal from "../data/modalTemplates/roleModal";
import SuccessErrorModal from "../organisms/successErrorModal";

// Data & utils
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import { useRoles } from "../hooks/useRoles";
import { useCreateRole } from "../hooks/useRoles";
import { toUserMessage } from "../services/serviceErrors";

export default function RolesPage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [current, setCurrent] = useState("roles");

  // Modal state for editing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPrivileges, setEditingPrivileges] = useState([]);
  const [roleName, setRoleName] = useState("");

  // Modal state for creating
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPrivileges, setCreatePrivileges] = useState([]);

  // Success/Error modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  // Confirmation modal state for delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    loadRoles,
    loadRoleById,
    updateRoleWithPrivileges,
    deleteRoleById,
  } = useRoles();

  const {
    loading: createLoading,
    error: createError,
    loadCreateRoleData,
    createRoleWithPrivileges,
  } = useCreateRole();

  // Row action handler
  const handleRowAction = async (col, row) => {
    if (col.key === "editar") {
      handleEditRole(row);
    } else if (col.key === "eliminar") {
      setRoleToDelete(row);
      setDeleteConfirmOpen(true);
    }
  };

  /**
   * Handle opening create role modal
   */
  const handleCreateRole = async () => {
    try {
      const privileges = await loadCreateRoleData();

      // Map privileges to modal table format
      const mappedPrivileges = (privileges || []).map((p) => ({
        id: p.id,
        label: p.name,
        checked: false,
      }));

      setCreatePrivileges(mappedPrivileges);
      setCreateModalOpen(true);
    } catch (err) {
      console.error("Error loading create role data:", err);
      setModalType("error");
      setModalMessage(
        "No se pudieron cargar los privilegios. Intente nuevamente."
      );
      setShowModal(true);
    }
  };

  /**
   * Handle create role modal confirmation
   */
  const handleCreateConfirm = async (
    name,
    description,
    selectedPrivilegeIds
  ) => {
    try {
      await createRoleWithPrivileges(name, description, selectedPrivilegeIds);

      // Close modal and refresh roles list
      setCreateModalOpen(false);
      await loadRoles();

      // Show success message
      setModalType("success");
      setModalMessage("El rol ha sido creado exitosamente.");
      setShowModal(true);
    } catch (err) {
      console.error("Error creating role:", err);

      if (err.code === "NETWORK_ERROR") {
        // Show network error without closing the modal
        setModalType("error");
        setModalMessage("No hay conexión con el servidor. Intenta más tarde.");
        setShowModal(true);
      } else if (err.response?.status === 409) {
        // Duplicate name error - handled by modal validation
      } else {
        // General error
        setModalType("error");
        setModalMessage(
          "No se pudo crear el rol. Por favor, intente nuevamente."
        );
        setShowModal(true);
      }
    }
  };
  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRoleById(roleToDelete.id);
      await loadRoles();

      setDeleteConfirmOpen(false);
      setRoleToDelete(null);

      setModalType("success");
      setModalMessage("El rol ha sido eliminado exitosamente");
      setShowModal(true);
    } catch (err) {
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);

      setModalType("error");
      setModalMessage(
        toUserMessage(
          err,
          "No se pudo eliminar el rol. Por favor, intente nuevamente"
        )
      );
      setShowModal(true);
    }
  };

  /**
   * Handle delete cancellation
   */
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setRoleToDelete(null);
  };

  /**
   * Handle opening edit role modal
   * @param {Object} row - Role row data from the table
   */
  const handleEditRole = async (row) => {
    try {
      // Load role details including privileges
      const roleData = await loadRoleById(row.id);

      // Map privileges to modal table format
      const mappedPrivileges = (roleData.privileges || []).map((p) => ({
        id: p.id,
        label: p.name,
        checked: !!p.checked,
      }));

      // Set state for editing
      setEditingRole(roleData);
      setRoleName(roleData.name || "");
      setEditingPrivileges(mappedPrivileges);
      setModalOpen(true);
    } catch (err) {
      console.error("Error loading role for edit:", err);
      setModalType("error");
      setModalMessage(
        "No se pudo cargar el rol para editar. Intente nuevamente."
      );
      setShowModal(true);
    }
  };

  /**
   * Handle edit role modal confirmation
   */
  const handleModalConfirm = async (
    name,
    description,
    selectedPrivilegeIds
  ) => {
    try {
      if (!editingRole?.id) return;

      await updateRoleWithPrivileges(
        editingRole.id,
        name,
        description,
        selectedPrivilegeIds
      );

      // Close modal and refresh roles list
      setModalOpen(false);
      setEditingRole(null);
      await loadRoles();

      // Show success message
      setModalType("success");
      setModalMessage("El rol ha sido actualizado exitosamente.");
      setShowModal(true);
    } catch (err) {
      console.error("Error updating role:", err);

      if (err.code === "NETWORK_ERROR") {
        // Show network error without closing the modal
        setModalType("error");
        setModalMessage("No hay conexión con el servidor. Intenta más tarde.");
        setShowModal(true);
      } else {
        // General error
        setModalType("error");
        setModalMessage(
          "No se pudo actualizar el rol. Por favor, intente nuevamente."
        );
        setShowModal(true);
      }
    }
  };

  /**
   * Handle edit modal cancel button
   */
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  /**
   * Handle modal close button
   */
  const handleCloseModal = () => {
    setShowModal(false);
    // If there was an error during create and modal is still open, keep it open
    if (modalType === "error" && createModalOpen) {
      setCreateModalOpen(true);
    }
  };

  /**
   * Build table columns on every render (safe default).
   * Note: This trades a tiny perf optimization (useMemo) for stability.
   */
  const roleColumns = buildRolePermissionsColumns({
    onEdit: handleEditRole,
    onDelete: (row) => {
      setRoleToDelete(row);
      setDeleteConfirmOpen(true);
    },
  });

  // Merge loading and error states from both hooks
  const loading = rolesLoading || createLoading;
  const mergedError = rolesError || createError;

  // Show a reusable full screen loader while fetching
  if (!isClerkLoaded || loading) {
    return <Loading fullscreen message="Cargando roles..." />;
  }

  // Friendly banner if there was any error (including network errors)
  const errorBanner = mergedError ? (
    <AlertBanner
      type="warning"
      message={toUserMessage(
        mergedError,
        "Ocurrió un problema al cargar los roles. Intenta nuevamente."
      )}
      onRetry={() => loadRoles?.()}
      className="mb-4"
    />
  ) : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader user={user} />
      <Sidebar current={current} onNavigate={setCurrent} />

      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto">
          <Title2 className="mb-6">Administración de Roles y Permisos</Title2>

          {errorBanner}

          <DataSwitchContainer
            initialKey="roles"
            loading={loading}
            views={[
              {
                key: "roles",
                label: "Roles & Permisos",
                type: "table",
                columns: roleColumns,
                rows: roles,
                searchPlaceholder: "Buscar roles...",
                onRowAction: handleRowAction,
              },
            ]}
            toolbarRight={
              <Button
                variant="brand"
                size="sm"
                radius="lg"
                onClick={handleCreateRole}
              >
                Crear nuevo rol
              </Button>
            }
          />
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteConfirmOpen}
          title="¿Eliminar rol?"
          message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.rol}"? Los usuarios asignados a este rol serán reasignados a 'Sin Rol'.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Edit Role Modal */}
        {editingRole && (
          <ChecklistModal
            open={modalOpen}
            title={`Editar Rol: ${roleName}`}
            dataName={roleName}
            dataDescription={editingRole.description || ""}
            tableData={editingPrivileges}
            existingData={roles}
            currentDataId={editingRole.id}
            confirmLabel="Guardar Cambios"
            onConfirm={handleModalConfirm}
            onClose={handleModalCancel}
          />
        )}

        {/* Create Role Modal */}
        <ChecklistModal
          open={createModalOpen}
          title="Crear Nuevo Rol"
          dataName=""
          dataDescription=""
          tableData={createPrivileges}
          existingData={roles}
          currentDataId={null}
          confirmLabel="Crear Rol"
          onConfirm={handleCreateConfirm}
          onClose={() => setCreateModalOpen(false)}
        />

        {/* Success/Error Modal */}
        <SuccessErrorModal
          open={showModal}
          onClose={handleCloseModal}
          type={modalType}
          message={modalMessage}
          title={
            modalType === "success"
              ? "¡Operación exitosa!"
              : "Error en la operación"
          }
        />
      </main>
    </div>
  );
}
