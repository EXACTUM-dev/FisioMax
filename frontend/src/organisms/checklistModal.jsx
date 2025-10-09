import React, { useState, useEffect, useRef } from "react";
import Modal from "../molecules/modal";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
//import CheckBox from "../atoms/checkBox";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";
//import helmetIcon from "../assets/icons/helmet.png";
//import CloseButton from "../atoms/closeButton";

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
  tableData = [{ id: 1, label: "Iniciar Sesión", checked: true },
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
  // Refs para los elementos focuseables
  const inputRef = useRef(null);
  const tableRef = useRef(null);
  const buttonRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Navegación por teclado
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      // ESC - Cerrar modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Tab - Navegación cíclica
      if (e.key === 'Tab') {
        e.preventDefault();
        
        const focusableElements = [
          closeButtonRef.current,
          inputRef.current,
          tableRef.current,
          buttonRef.current
        ].filter(Boolean);

        const currentIndex = focusableElements.indexOf(document.activeElement);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
          : (currentIndex + 1) % focusableElements.length;

        focusableElements[nextIndex]?.focus();
        return;
      }

      // Enter en el botón de confirmar
      if (e.key === 'Enter' && document.activeElement === buttonRef.current) {
        handleConfirm();
        return;
      }

      // Navegación en la tabla con flechas
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && 
          document.activeElement === tableRef.current) {
        e.preventDefault();
        // Aquí puedes implementar navegación entre filas de la tabla
        console.log('Navegación en tabla con flechas');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus en el input al abrir
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleToggle = (id) => {
    setCheckedPrivileges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConfirm = () => {
    const selectedPrivileges = Object.entries(checkedPrivileges)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    onConfirm?.(roleName, selectedPrivileges);
  };

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
  };

  return (
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
                ref={inputRef}
                label="Nombre del Rol"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ingrese el nombre del rol"
                onKeyDown={(e) => {
                  // Enter en el input va al botón
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    buttonRef.current?.focus();
                  }
                }}
              />
              <Button
                ref={buttonRef}
                label={confirmLabel}
                variant="brand"
                onClick={handleConfirm}
                radius="lg"
                className="w-full py-3 text-base"
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
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
  );
}