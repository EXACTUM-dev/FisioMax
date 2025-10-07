import React, { useState } from "react";
import Button from "../atoms/button";
import { Title1 } from "../atoms/typography";
import { Title2 } from "../atoms/typography";
import { Title3 } from "../atoms/typography";
import { Title4 } from "../atoms/typography";
import CheckBox from "../atoms/checkBox";
import FieldBox from "../molecules/form";
import helmetIcon from "../assets/icons/helmet.png";

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
  privileges = [
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
  onCancel,
}) {
  const [roleName, setRoleName] = useState(initialRoleName);
  const [checkedPrivileges, setCheckedPrivileges] = useState(
    privileges.reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? true;
      return acc;
    }, {})
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-10 border border-slate-200 relative">
        {/* Botón cerrar */}
        <Button
          label="×"
          variant="outline"
          onClick={onCancel}
          radius="xl"
          className="absolute top-6 right-6 w-10 h-10 !p-0 text-2xl font-bold"
        />

        {/* Layout de dos columnas */}
        <div className="flex gap-12">
          {/* Columna izquierda - Formulario */}
          <div className="flex-1 min-w-[320px] flex flex-col justify-center">
            {/* Título, input y botón centrados verticalmente */}
            <div className="flex flex-col items-center justify-center h-full">
              <Title2 className="mb-4">{title}</Title2>
              <FieldBox
                label="Nombre del Rol"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ingrese el nombre del rol"
              />
              <Button
                label={confirmLabel}
                variant="brand"
                onClick={handleConfirm}
                radius="lg"
                className="w-full py-3 text-base"
              />
            </div>
          </div>

          {/* Columna derecha - Checklist */}
          <div className="flex-1 min-w-[320px]">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              {/* Header del checklist */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-300">
                <span className="text-base font-semibold text-slate-600">
                  PERMISOS
                </span>
                <span className="text-base font-semibold text-slate-600">
                  USUARIO
                </span>
              </div>

              {/* Lista de privilegios con scroll */}
              <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
                {privileges.map((privilege, index) => (
                  <div
                    key={privilege.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-base text-slate-700">
                      {index + 1}. {privilege.label}
                    </span>
                    <CheckBox
                      checked={!!checkedPrivileges[privilege.id]}
                      onChange={() => handleToggle(privilege.id)}
                      className="w-6 h-6"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}