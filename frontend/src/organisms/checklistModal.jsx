import React, { useMemo, useState } from "react";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import CheckBox from "../atoms/checkBox";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";
import Modal from "../molecules/modal";

/**
 * Modal to edit role with a privileges checklist.
 * Props:
 * - open: boolean
 * - title: string
 * - roleName: string
 * - tableData: array [{ id, label, checked }]
 * - confirmLabel: string
 * - onConfirm: (roleName, selectedPrivilegesIds) => void
 * - onCancel: () => void
 */
export default function ChecklistModal({
  open,
  title = "Modificar Rol",
  roleName: initialRoleName = "Administrador",
  tableData = [],
  confirmLabel = "Modificar Rol",
  onConfirm,
  onClose,
}) {
  const [roleName, setRoleName] = useState(initialRoleName);
  const [checkedPrivileges, setCheckedPrivileges] = useState(() =>
    (tableData || []).reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? false;
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
      .map(([id]) => id);
    onConfirm?.(roleName, selectedPrivileges);
  };

  // Columns for privileges table (ID, Checkbox, Label)
  const tableColumns = useMemo(
    () => [
      {
        key: "checked",
        label: "Sel.",
        headAlign: "center",
        align: "center",
        isAction: true,
        render: (row) => (
          <CheckBox
            ariaLabel={`Toggle ${row.label}`}
            checked={!!checkedPrivileges[row.id]}
            onChange={() => handleToggle(row.id)}
          />
        ),
      },
      {
        key: "label",
        label: "Permiso",
        headAlign: "left",
        align: "left",
      },
    ],
    [checkedPrivileges]
  );

  return (
    <Modal open={open} onClose={onClose} size="xl" className="p-8">
      <div className="flex gap-12">
        {/* Left: form */}
        <div className="flex-1 min-w-[320px] flex flex-col justify-center">
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

        {/* Right: privileges checklist */}
        <div className="flex-1 min-w-[320px]">
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="bg-white rounded-lg border border-slate-200 max-h-[32rem] overflow-y-auto p-2">
              <DataTable columns={tableColumns} data={tableData} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
