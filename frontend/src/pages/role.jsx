/**
 * Version: 1.0.3
 * Página de administración de roles y permisos
 * FIX: Usa allPrivileges del hook en lugar de extraer de roles
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
import { getRoles, getPermisos } from "../data/mockApi";
import buildRolePermissionsColumns from "../data/tableTemplates/rolePermissionsColumns";
import privilagesTable from "../data/tableTemplates/privilagesTableColumns";
import { useRoles } from "../hooks/useRoles";
import buildPermisosTableColumns from "../data/tableTemplates/permisosTableColumns";

// Atoms
import Button from "../atoms/button";

// Organisms
import DataTable from "../organisms/dataTable";

export default function RolesPage() {
  const { user, isLoaded } = useUser();
  const [current, setCurrent] = useState("roles"); // Marcamos "roles" como activo en sidebar
  const [roleRows, setRoleRows] = useState([]);
  const [permisoRows, setPermisoRows] = useState([]);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Cargar datos de roles y permisos
  useEffect(() => {
    let alive = true;
    async function fetchData() {
      try {
        const [roles, permisos] = await Promise.all([
          getRoles(),
          getPermisos(),
        ]);
        if (!alive) return;
        setRoleRows(roles);
        setPermisoRows(permisos);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
  }, []);

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
    if (window.confirm(`¿Estás seguro de eliminar el rol "${role.rol}"?`)) {
      try {
        await deleteRoleById(role.id);
      } catch (err) {
        console.error("Error eliminando rol:", err);
        alert("Error al eliminar el rol");
      }
    }
  };

  const handleModalConfirm = async (updatedData) => {
    try {
      console.log("Guardar cambios:", updatedData);
      setModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      console.error("Error guardando cambios:", err);
      alert("Error al guardar los cambios");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingRole(null);
    setEditingPrivileges([]);
    setRoleName("");
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

  const permissionsColumns = useMemo(
    () =>
      privilagesTable({
        onEdit: handleEditRole,
        onDelete: handleDeleteRole,
      }),
    []
  );

  // Columnas para tabla de permisos
  const permisoColumns = useMemo(
    () => buildPermisosTableColumns(),
    []
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando roles y privilegios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
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
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            Roles y Permisos
          </h1>

          {/* Sección de Roles */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Roles</h2>
              <Button 
                size="sm" 
                label="Crear nuevo rol"
                onClick={() => console.log("Crear nuevo rol")}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <DataTable
                columns={roleColumns}
                rows={roleRows}
                searchPlaceholder="Buscar roles..."
                showSearch={false}
              />
            </div>
          </div>

          {/* Sección de Permisos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Permisos</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <DataTable
                columns={permisoColumns}
                rows={permisoRows}
                searchPlaceholder="Buscar permisos..."
                showSearch={false}
              />
            </div>
          </div>
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