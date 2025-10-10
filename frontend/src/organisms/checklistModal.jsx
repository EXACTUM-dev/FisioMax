import React, { useState } from "react";
import Modal from "../molecules/modal";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";
import ConfirmModal from "../molecules/confirmationModal";

/**
 * Modal para modificar rol con checklist de privilegios.
 * Props:
 * - open: boolean (si está abierto o no)
 * - title: string (título del modal, default "Modificar Rol")
 * - roleName: string (nombre inicial del rol)
 * - privileges: array de objetos { id, label, checked }
 * - confirmLabel: string (texto del botón confirmar)
 * - onConfirm: (roleName, selectedPrivileges) => void
 * - onCancel: () => void
 */
export default function ChecklistModal({
  open,
  title = "Modificar Rol",
  roleName: initialRoleName = "Administrador",
  tableColumns = [
    //{ key: "id", label: "ID", headAlign: "left", align: "left" },
    { key: "label", label: "Permiso", headAlign: "left", align: "left" },
  ],
  tableData = [
    { id: 1, label: "Iniciar Sesión", checked: true },
    { id: 2, label: "Cerrar Sesión", checked: true },
    { id: 3, label: "Crear Usuarios", checked: true },
    { id: 4, label: "Editar Usuarios", checked: true },
    { id: 5, label: "Eliminar Usuarios", checked: false },
    { id: 6, label: "Ver Reportes", checked: true },
    { id: 7, label: "Exportar Datos", checked: true },
    { id: 8, label: "Configurar Sistema", checked: false },
    { id: 9, label: "Iniciar Sesión", checked: true },
    { id: 10, label: "Cerrar Sesión", checked: true },
    { id: 11, label: "Crear Usuarios", checked: true },
    { id: 12, label: "Editar Usuarios", checked: true },
    { id: 13, label: "Eliminar Usuarios", checked: false },
    { id: 14, label: "Ver Reportes", checked: true },
    { id: 15, label: "Exportar Datos", checked: true },
    { id: 16, label: "Configurar Sistema", checked: false },
  ],
  confirmLabel = "Modificar Rol",
  onConfirm,
  onClose,
}) {
  const [roleName, setRoleName] = useState(initialRoleName);
  const [checkedPrivileges, setCheckedPrivileges] = useState(
    tableData.reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? true;
      return acc;
    }, {})
  );
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  if (!open) return null;

  const handleToggle = (id) => {
    setCheckedPrivileges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConfirm = () => {
    const selectedPrivileges = Object.entries(checkedPrivileges)
      .filter(([_, checked]) => checked)
      .map(([id, _]) => id);
    onConfirm?.(roleName, selectedPrivileges);
    setConfirmModalOpen(false);
  };

  const handleModifyRole = () => {
    setConfirmModalOpen(true);
  };

  return (
    <>
      <Modal 
        open={open} 
        onClose={onClose}
        size="xl"
        className="p-8"
      >
        {/* Layout de dos columnas */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
          {/* Columna izquierda - Formulario */}
          <div className="flex-1 min-w-[320px] flex flex-col justify-center">
            {/* Título, input y botón centrados verticalmente */}
            <div className="flex flex-col items-center justify-center h-full">
              <Title2 className="mb-12">{title}</Title2>
              <FieldBox
                label="Nombre del Rol"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ingrese el nombre del rol"
              />
              <Button
                label={confirmLabel}
                variant="brand"
                onClick={handleModifyRole}
                radius="lg"
                className="w-full py-3 text-base"
              />
            </div>
          </div>

          {/* Columna derecha - Checklist */}
          <div className="flex-1 min-w-[320px]">
            {/* DataTable con scroll independiente */}
            <div className="bg-white rounded-lg border border-slate-200 max-h-[32rem] overflow-y-auto p-2
              [&::-webkit-scrollbar]:w-3
              [&::-webkit-scrollbar-track]:bg-slate-100
              [&::-webkit-scrollbar-track]:rounded-lg
              [&::-webkit-scrollbar-thumb]:bg-slate-300
              [&::-webkit-scrollbar-thumb]:rounded-lg
              [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
              <DataTable columns={tableColumns} data={tableData} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={isConfirmModalOpen}
        title="Confirmar Modificación"
        message="¿Estás seguro de que deseas modificar este rol?"
        confirmLabel="Sí, modificar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </>
  );
}