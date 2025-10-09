/**
 * Version: 1.0.1
 * Página de administración de roles y permisos
 * Permite visualizar, editar y eliminar roles del sistema
 * FIX: Eliminado DataSwitchContainer duplicado
 */

import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import ChecklistModal from "../organisms/checklistModal";

// Data y utils
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import { useRoles } from "../hooks/useRoles";

export default function RolesPage() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("roles");
  

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPrivileges, setEditingPrivileges] = useState([]);
  const [roleName, setRoleName] = useState("");

  const {
    roles, 
    loading,
    error,
    loadRoleById,
    deleteRoleById
  } = useRoles();

  // Manejadores para el modal
  const handleEditRole = async (role) => {
    try {
      const roleData = await loadRoleById(role.id);
      setEditingRole(roleData);
      setRoleName(roleData.name || roleData.rol);
      setEditingPrivileges(roleData.privileges || []);
      setModalOpen(true);
    } catch (err) {
      console.error("Error cargando rol para edición:", err);
    }
  };

  const handleDeleteRole = async (role) => {
    try {
      await deleteRoleById(role.id);
    } catch (err) {
      console.error("Error eliminando rol:", err);
    }
  };

  // Columnas para tabla de roles con comportamiento de modal
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: handleEditRole,
        onDelete: handleDeleteRole,
      }),
    []
  );

  if (!isLoaded || loading) {
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
          <p className="text-red-600">Error: {error}</p>
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
              },
            ]}
          />
        </div>

        {/* Modal de edición */}
        {editingRole && (
          <ChecklistModal
            open={modalOpen}
            title={`Editar Rol: ${editingRole?.rol || ""}`}
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