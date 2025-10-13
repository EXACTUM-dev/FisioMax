import React, { useMemo, useState, useRef } from "react";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import CheckBox from "../atoms/checkBox";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";
import Modal from "../molecules/modal";

/**
 * Modal to edit role with name, description and privileges checklist.
 * @component
 * @param {boolean} open - Modal open state
 * @param {string} title - Modal title
 * @param {string} roleName - Initial role name
 * @param {string} roleDescription - Initial role description
 * @param {Array} tableData - Array of privilege objects [{ id, label, checked }]
 * @param {string} confirmLabel - Confirm button label
 * @param {Function} onConfirm - Callback on confirm (roleName, roleDescription, selectedPrivilegesIds)
 * @param {Function} onClose - Callback on close
 */
export default function ChecklistModal({
  open,
  title = "Modificar Rol",
  roleName: initialRoleName = "Administrador",
  roleDescription: initialRoleDescription = "",
  tableData = [],
  confirmLabel = "Modificar Rol",
  onConfirm,
  onClose,
}) {
  const [roleName, setRoleName] = useState(initialRoleName);
  const [roleDescription, setRoleDescription] = useState(
    initialRoleDescription
  );
  const [checkedPrivileges, setCheckedPrivileges] = useState(() =>
    (tableData || []).reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? false;
      return acc;
    }, {})
  );

  // Refs for focusable elements
  const inputRef = useRef(null);
  const descriptionRef = useRef(null);
  const tableRef = useRef(null);
  const buttonRef = useRef(null);
  const closeButtonRef = useRef(null);

  if (!open) return null;

  /**
   * Toggle individual privilege selection
   * @param {string} id - Privilege ID
   */
  const handleToggle = (id) => {
    setCheckedPrivileges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /**
   * Toggle all privileges selection
   */
  const handleSelectAll = () => {
    const allChecked = tableData.every((priv) => checkedPrivileges[priv.id]);
    const newState = {};
    tableData.forEach((priv) => {
      newState[priv.id] = !allChecked;
    });
    setCheckedPrivileges(newState);
  };

  /**
   * Handle form confirmation
   */
  const handleConfirm = () => {
    const selectedPrivileges = Object.entries(checkedPrivileges)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    onConfirm?.(roleName, roleDescription, selectedPrivileges);
  };

  const allSelected =
    tableData.length > 0 &&
    tableData.every((priv) => checkedPrivileges[priv.id]);

  const tableDataWithIndex = useMemo(
    () =>
      tableData.map((item, index) => ({
        ...item,
        sequenceNumber: index + 1,
      })),
    [tableData]
  );

  // Columns for privileges table (ID, Checkbox, Label)
  const tableColumns = useMemo(
    () => [
      {
        key: "check",
        label: (
          <div className="flex items-center gap-2">
            <CheckBox
              ariaLabel="Seleccionar todos"
              checked={allSelected}
              onChange={handleSelectAll}
            />
            <span>ID</span>
          </div>
        ),
        headAlign: "left",
        align: "left",
        isAction: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <CheckBox
              ariaLabel={`Toggle ${row.label}`}
              checked={!!checkedPrivileges[row.id]}
              onChange={() => handleToggle(row.id)}
            />
            <span className="text-sm text-slate-600 min-w-[2rem]">
              {row.sequenceNumber}
            </span>
          </div>
        ),
      },
      {
        key: "label",
        label: "Permiso",
        headAlign: "left",
        align: "left",
      },
    ],
    [checkedPrivileges, allSelected]
  );

  return (
    <Modal open={open} onClose={onClose} size="xl" className="p-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
        {/* Left column - Form */}
        <div className="flex-1 min-w-[320px] flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center h-full">
            <Title2 className="mb-8">{title}</Title2>

            {/* Role name input */}
            <FieldBox
              ref={inputRef}
              label="Nombre del Rol"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ingrese el nombre del rol"
            />

            {/* Role description input */}
            <FieldBox
              ref={descriptionRef}
              label="Descripción del Rol"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Ingrese la descripción del rol"
              className="mt-4"
            />

            {/* Confirm button */}
            <Button
              ref={buttonRef}
              label={confirmLabel}
              variant="brand"
              onClick={handleConfirm}
              radius="lg"
              className="w-full py-3 text-base mt-4"
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        {/* Right column - Privileges checklist */}
        <div className="flex-1 min-w-[320px]">
          <div
            className="bg-white rounded-lg border border-slate-200 max-h-[32rem] overflow-y-auto p-2
              [&::-webkit-scrollbar]:w-3
              [&::-webkit-scrollbar-track]:bg-slate-100
              [&::-webkit-scrollbar-track]:rounded-lg
              [&::-webkit-scrollbar-thumb]:bg-slate-300
              [&::-webkit-scrollbar-thumb]:rounded-lg
              [&::-webkit-scrollbar-thumb]:hover:bg-slate-400"
          >
            <DataTable columns={tableColumns} data={tableDataWithIndex} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
