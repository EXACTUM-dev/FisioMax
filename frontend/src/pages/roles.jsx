/**
 * Version: 1.1.0
 * Role management page: list, edit via modal
 */

import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Atoms
import Loading from "../atoms/loading";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import ChecklistModal from "../data/modalTemplates/roleModal";
import SuccessErrorModal from "../organisms/successErrorModal";

// Data & utils
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import { useRoles } from "../hooks/useRoles";

export default function RolesPage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [current, setCurrent] = useState("roles");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPrivileges, setEditingPrivileges] = useState([]);
  const [roleName, setRoleName] = useState("");

  // Success/Error modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // "success" | "error"
  const [modalMessage, setModalMessage] = useState("");

  const {
    roles,
    loading,
    error,
    loadRoleById,
    updateRoleWithPrivileges,
    deleteRoleById,
  } = useRoles();

  // Row action handler
  const handleRowAction = (col, row) => {
    if (col.key === "editar") {
      handleEditRole(row);
    } else if (col.key === "eliminar") {
      deleteRoleById(row.id);
    }
  };

  /**
   * Open edit modal and load role data
   * @param {Object} rowRole - Role object from table row
   */
  const handleEditRole = async (rowRole) => {
    try {
      const roleData = await loadRoleById(rowRole.id);

      // Map backend privileges to modal table format
      const mappedPrivileges = (roleData.privileges ?? []).map((p) => ({
        id: p.id,
        label: p.name,
        checked: !!p.checked,
      }));

      setEditingRole(roleData);
      setRoleName(roleData.name || "");
      setEditingPrivileges(mappedPrivileges);
      setModalOpen(true);
    } catch (err) {
      console.error("Error cargando rol para edición:", err);
      setModalType("error");
      setModalMessage(
        "No se pudo cargar la información del rol. Por favor, intenta nuevamente."
      );
      setShowModal(true);
    }
  };

  /**
   * Handle modal confirmation - update role with new data
   * @param {string} newRoleName - Updated role name
   * @param {string} newRoleDescription - Updated role description
   * @param {Array<string>} selectedPrivilegeIds - Array of selected privilege IDs
   */
  const handleModalConfirm = async (
    newRoleName,
    newRoleDescription,
    selectedPrivilegeIds
  ) => {
    if (!editingRole?.id) return;

    try {
      await updateRoleWithPrivileges(
        editingRole.id,
        newRoleName,
        newRoleDescription,
        selectedPrivilegeIds
      );
      setModalOpen(false);
      setEditingRole(null);

      // Show success modal
      setModalType("success");
      setModalMessage("El rol ha sido actualizado exitosamente.");
      setShowModal(true);
    } catch (err) {
      console.error("Error actualizando rol:", err);

      // Show error modal
      setModalType("error");
      setModalMessage(
        "No se pudieron guardar los cambios. Por favor, intenta nuevamente."
      );
      setShowModal(true);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Si hubo error, mantener el modal de edición abierto
    if (modalType === "error" && editingRole) {
      setModalOpen(true);
    }
  };

  // Table columns
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: handleEditRole,
        onDelete: (row) => deleteRoleById(row.id),
      }),
    [deleteRoleById]
  );

  if (!isClerkLoaded || loading) {
    return <Loading fullscreen message="Cargando..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Error: {error}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AppHeader user={user} />
      <Sidebar current={current} onNavigate={setCurrent} />

      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">
            Administración de Roles y Permisos
          </h1>

          <DataSwitchContainer
            initialKey="roles"
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
          />
        </div>

        {editingRole && (
          <ChecklistModal
            open={modalOpen}
            title={`Editar Rol: ${roleName}`}
            dataName={roleName}
            dataDescription={editingRole.description || ""}
            tableData={editingPrivileges}
            existingRoles={roles}
            currentRoleId={editingRole.id}
            confirmLabel="Guardar Cambios"
            onConfirm={handleModalConfirm}
            onClose={handleModalCancel}
          />
        )}

        {/* Modal de éxito/error reutilizable */}
        <SuccessErrorModal
          open={showModal}
          onClose={handleCloseModal}
          type={modalType}
          message={modalMessage}
          title={
            modalType === "success" ? "¡Cambios guardados!" : "Error al guardar"
          }
        />
      </main>
    </div>
  );
}
