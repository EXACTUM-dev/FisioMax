/**
 * Version: 1.1.0
 * Role management page: list, edit via modal
 */

import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import ChecklistModal from "../organisms/checklistModal";

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

  const {
    roles,
    loading,
    error,
    loadRoleById,
    updateRoleWithPrivileges,
    deleteRoleById,
  } = useRoles();

  // Row action handler (optional, for future actions)
  const handleRowAction = (col, row) => {
    if (col.key === "editar") {
      handleEditRole(row);
    } else if (col.key === "eliminar") {
      deleteRoleById(row.id);
    }
  };

  // Open edit modal and load role data
  const handleEditRole = async (rowRole) => {
    try {
      const roleData = await loadRoleById(rowRole.id); // {id,name,description,privileges[]}
      // Map backend privileges -> table rows expected by modal
      const mappedPrivileges = (roleData.privileges ?? []).map((p) => ({
        id: p.id,
        label: p.name, // ChecklistModal expects 'label'
        checked: !!p.checked,
      }));

      setEditingRole(roleData);
      setRoleName(roleData.name || "");
      setEditingPrivileges(mappedPrivileges);
      setModalOpen(true);
    } catch (err) {
      console.error("Error cargando rol para edición:", err);
    }
  };

  const handleModalConfirm = async (newRoleName, selectedPrivilegeIds) => {
    if (!editingRole?.id) return;

    try {
      await updateRoleWithPrivileges(
        editingRole.id,
        newRoleName,
        selectedPrivilegeIds
      );

      setModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      console.error("Error actualizando rol:", err);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingRole(null);
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
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
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
            roleName={roleName}
            tableData={editingPrivileges}
            confirmLabel="Guardar Cambios"
            onConfirm={handleModalConfirm}
            onCancel={handleModalCancel}
          />
        )}
      </main>
    </div>
  );
}
