/**
 * Version: 1.0.0
 * Página de administración de roles y permisos
 * Permite visualizar, editar y eliminar roles del sistema
 */

import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

// Organisms
import DataSwitchContainer from "../organisms/dataSwitchContainer";
import ChecklistModal from "../organisms/checklistModal";

// Data y utils
import { getRoles } from "../data/mockApi";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";

export default function RolesPage() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("roles"); // Marcamos "roles" como activo en sidebar
  const [roleRows, setRoleRows] = useState([]);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Cargar datos de roles
  useEffect(() => {
    let alive = true;
    getRoles().then((roles) => {
      if (!alive) return;
      setRoleRows(roles);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Manejadores para el modal
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    // Aquí iría la lógica para guardar cambios al rol
    console.log("Guardando cambios al rol:", selectedRole);
    setModalOpen(false);
    setSelectedRole(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedRole(null);
  };

  // Columnas para tabla de roles con comportamiento de modal
  const roleColumns = useMemo(
    () =>
      buildRolePermissionsColumns({
        onEdit: handleEditRole,
        onDelete: (row) =>
          setRoleRows((prev) => prev.filter((r) => r.id !== row.id)),
      }),
    []
  );

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
      {/* Header refactorizado como molécula; responde a sidebar y deja margen inferior */}
      <AppHeader user={user} />

      {/* Sidebar fija */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main con margen que responde a la sidebar */}
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
                rows: roleRows,
                searchPlaceholder: "Buscar roles...",
              },
            ]}
          />
        </div>

        {/* Modal de edición */}
        <ChecklistModal
          open={modalOpen}
          title={`Editar Rol: ${selectedRole?.rol || ""}`}
          message={`Actualiza los permisos para el rol ${
            selectedRole?.rol || ""
          }`}
          confirmLabel="Guardar Cambios"
          cancelLabel="Cancelar"
          onConfirm={handleModalConfirm}
          onClose={handleModalCancel}
        />
      </main>
    </div>
  );
}
