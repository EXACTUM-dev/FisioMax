/**
 * @fileoverview Modal component for editing roles with name, description, and privileges checklist.
 * @author EXACTUM-dev
 * @version 1.1.1
 * @description Keeps modal size stable and scrolls the privileges list instead of growing the modal.
 */

// Import application dependencies
import React, { useState, useMemo, useRef, useEffect } from "react";
import Button from "../../atoms/button";
import { Title2 } from "../../atoms/typography";
import FieldBox from "../../molecules/form";
import DataTable from "../../organisms/dataTable";
import Modal from "../../molecules/modal";
import CheckBox from "../../atoms/checkBox";
import {
  validateRoleName,
  areArraysSameSet,
} from "../../utils/validationUtils";
import { usePrivileges } from "../../hooks/usePrivileges";

/**
 * Modal to edit/create role with name, description, and privileges checklist.
 * This inner component always mounts when open, keeping a stable Hooks order.
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Modal open state
 * @param {string} props.title - Modal title
 * @param {string} props.dataName - Initial role name
 * @param {string} props.dataDescription - Initial role description
 * @param {Array} props.tableData - Array of privilege objects [{ id, label, checked }]
 * @param {Array} props.existingData - Array of existing roles for duplicate validation
 * @param {string|number|null} props.currentDataId - Current role ID for edit mode (null in create mode)
 * @param {string} props.confirmLabel - Confirm button label
 * @param {Function} props.onConfirm - Callback on confirm (dataName, dataDescription, selectedPrivilegesIds)
 * @param {Function} props.onClose - Callback on close
 * @returns {React.Element} Checklist modal component
 */
function ChecklistModalContent({
  open,
  title = "Titulo del Modal",
  dataName: initialDataName = "",
  dataDescription: initialDataDescription = "",
  tableData = [],
  existingData = [],
  currentDataId = null,
  confirmLabel = "Título del Botón",
  onConfirm,
  onClose,
}) {
  // State management for form fields and validation
  const [dataName, setDataName] = useState(initialDataName);
  const [dataDescription, setDataDescription] = useState(
    initialDataDescription
  );
  const [nameError, setNameError] = useState("");

  const {
    checkedPrivileges,
    allSelected,
    handleToggle,
    handleSelectAll,
    currentSelectedIds,
  } = usePrivileges(tableData);

  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 100);
    }
  }, [open]);

  const handleConfirm = () => {
    const { isValid, errorMessage } = validateRoleName(
      dataName,
      existingData,
      currentDataId
    );
    if (!isValid) {
      setNameError(errorMessage);
      return;
    }
    const selectedPrivileges = currentSelectedIds;
    onConfirm?.(dataName, dataDescription, selectedPrivileges);
  };

  const initialSelectedIds = useMemo(
    () => (tableData || []).filter((p) => !!p.checked).map((p) => String(p.id)),
    [tableData]
  );

  const isDirty = useMemo(() => {
    const nameChanged =
      (dataName || "").trim() !== (initialDataName || "").trim();
    const descChanged =
      (dataDescription || "").trim() !== (initialDataDescription || "").trim();
    const privsChanged = !areArraysSameSet(
      currentSelectedIds,
      initialSelectedIds
    );

    if (currentDataId == null) {
      const hasAnyInput =
        (dataName || "").trim() !== "" ||
        (dataDescription || "").trim() !== "" ||
        currentSelectedIds.length > 0;
      return hasAnyInput;
    }

    return nameChanged || descChanged || privsChanged;
  }, [
    dataName,
    dataDescription,
    initialDataName,
    initialDataDescription,
    currentSelectedIds,
    initialSelectedIds,
    currentDataId,
  ]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      requireConfirmation={isDirty}
    >
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
        {/* Left column - form */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Title2 className="mb-4 sm:mb-6 lg:mb-8 text-lg sm:text-xl lg:text-2xl text-center">
            {title}
          </Title2>

          <FieldBox
            ref={inputRef}
            label="Nombre del Rol"
            value={dataName}
            onChange={(e) => setDataName(e.target.value)}
            placeholder="Ingrese el nombre del rol"
            className="w-full"
          />

          {nameError && (
            <div className="text-red-500 text-xs sm:text-sm mt-1 mb-2 ml-0 font-medium text-left w-full">
              {nameError}
            </div>
          )}

          <FieldBox
            label="Descripción del Rol"
            value={dataDescription}
            onChange={(e) => setDataDescription(e.target.value)}
            placeholder="Ingrese la descripción del rol"
            className="w-full mt-3 sm:mt-4"
          />

          <Button
            label={confirmLabel}
            variant="brand"
            onClick={handleConfirm}
            radius="lg"
            className="w-full py-2 sm:py-3 text-sm sm:text-base mt-4 sm:mt-6"
          />
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-slate-200 mx-2" />

        {/* Right column - scrollable privileges list */}
        <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
          {/* Fixed-height scroll area so the modal does not grow */}
          <div
            className="
              bg-white rounded-lg border border-slate-200
              h-64 sm:h-80 lg:h-96 overflow-y-auto p-2 sm:p-3
              [&::-webkit-scrollbar]:w-2 sm:[&::-webkit-scrollbar]:w-3
              [&::-webkit-scrollbar-track]:bg-slate-100
              [&::-webkit-scrollbar-track]:rounded-lg
              [&::-webkit-scrollbar-thumb]:bg-slate-300
              [&::-webkit-scrollbar-thumb]:rounded-lg
              [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
            "
          >
            <DataTable
              columns={[
                {
                  key: "check",
                  label: (
                    <div className="flex items-center gap-2">
                      <CheckBox
                        ariaLabel="Seleccionar todos"
                        checked={allSelected}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm sm:text-base">ID</span>
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
                  render: (row) => (
                    <span className="text-sm sm:text-base break-words">
                      {row.label}
                    </span>
                  ),
                },
              ]}
              data={tableData.map((item, index) => ({
                ...item,
                sequenceNumber: index + 1,
              }))}
              className="text-xs sm:text-sm"
            />
          </div>
          {/* Mobile select all button */}
          {tableData.length > 0 && (
            <div className="lg:hidden mt-3 flex justify-center">
              <Button
                label={
                  allSelected ? "Deseleccionar Todos" : "Seleccionar Todos"
                }
                variant="brand"
                onClick={handleSelectAll}
                size="sm"
                className="text-xs"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Wrapper component that controls visibility.
 * It prevents conditional hooks by mounting/unmounting the content.
 */
export default function ChecklistModal(props) {
  if (!props.open) return null;
  return <ChecklistModalContent {...props} />;
}
