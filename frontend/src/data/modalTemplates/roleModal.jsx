import React, { useMemo, useState, useRef, useEffect} from "react";
import Button from "../../atoms/button";
import { Title2 } from "../../atoms/typography";
import CheckBox from "../../atoms/checkBox";
import FieldBox from "../../molecules/modal";
import DataTable from "../../organisms/dataTable";
import Modal from "../../molecules/modal";

/**
 * Author: Jaime Trujillo
 * Version: 1.0.0
 * Modal component for editing roles with name, description and privileges checklist.
 * Includes form validation, duplicate checking, and accessibility features.
 */

/**
 * Modal to edit role with name, description and privileges checklist.
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Modal open state
 * @param {string} props.title - Modal title
 * @param {string} props.dataName - Initial role name
 * @param {string} props.dataDescription - Initial role description
 * @param {Array} props.tableData - Array of privilege objects [{ id, label, checked }]
 * @param {Array} props.existingData - Array of existing roles for duplicate validation
 * @param {string|null} props.currentDataId - Current role ID for edit mode
 * @param {string} props.confirmLabel - Confirm button label
 * @param {Function} props.onConfirm - Callback on confirm (dataName, dataDescription, selectedPrivilegesIds)
 * @param {Function} props.onClose - Callback on close
 * @returns {React.Element} Checklist modal component
 */
export default function ChecklistModal({
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
  
  // State for tracking checked privileges
  const [checkedPrivileges, setCheckedPrivileges] = useState(() =>
    (tableData || []).reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? false;
      return acc;
    }, {})
  );

  // Refs for focusable elements
  const inputRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);

  // Effect to focus first input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 100);
    }
  }, [open]);

  // Return null if modal is not open
  if (!open) return null;

  /**
   * Validate role name for duplicates and empty values
   * @param {string} name - Role name to validate
   * @returns {boolean} - True if valid, false if duplicate or empty
   */
  const validateRoleName = (name) => {
    if (!name || name.trim() === "") {
      setNameError("El nombre del rol no puede estar vacío");
      return false;
    }
    
    console.log("Validating role name:", existingData);
    const isDuplicate = existingData.some(
      (role) =>
        role.rol.toLowerCase().trim() === name.toLowerCase().trim() &&
        role.id !== currentDataId
    );

    if (isDuplicate) {
      setNameError(`Ya existe un rol con el nombre "${name}"`);
      return false;
    }

    setNameError("");
    return true;
  };

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
   * Handle form confirmation with validation
   */
  const handleConfirm = () => {
    if (!validateRoleName(dataName)) {
      return;
    }
    const selectedPrivileges = Object.entries(checkedPrivileges)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    onConfirm?.(dataName, dataDescription, selectedPrivileges);
  };

  /**
   * Handle Enter key press for form submission
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior
      handleConfirm();
    }
  };

  // Check if all privileges are selected
  const allSelected =
    tableData.length > 0 &&
    tableData.every((priv) => checkedPrivileges[priv.id]);

  // Memoized table data with sequence numbers
  const tableDataWithIndex = useMemo(
    () =>
      tableData.map((item, index) => ({
        ...item,
        sequenceNumber: index + 1,
      })),
    [tableData]
  );

  // Columns configuration for privileges table
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
          <span className="text-sm sm:text-base break-words">{row.label}</span>
        ),
      },
    ],
    [checkedPrivileges, allSelected]
  );

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      size="xl" 
      requireConfirmation={true}
    >
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full" onKeyDown={handleKeyDown}>
        {/* Left column - Form inputs */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-col items-center justify-center h-full">
            <Title2 className="mb-4 sm:mb-6 lg:mb-8 text-lg sm:text-xl lg:text-2xl text-center">
              {title}
            </Title2>

            {/* Role name input with validation */}
            <div className="w-full">
              <FieldBox
                ref={inputRef}
                label="Nombre del Rol"
                value={dataName}
                onChange={(e) => setDataName(e.target.value)}
                placeholder="Ingrese el nombre del rol"
                className="w-full"
              />
              {/* Error message display */}
              {nameError && (
                <div className="text-red-500 text-xs sm:text-sm mt-1 mb-2 ml-0 font-medium text-left w-full">
                  {nameError}
                </div>
              )}
            </div>

            {/* Role description input */}
            <div className="w-full mt-3 sm:mt-4">
              <FieldBox
                ref={descriptionRef}
                label="Descripción del Rol"
                value={dataDescription}
                onChange={(e) => setDataDescription(e.target.value)}
                placeholder="Ingrese la descripción del rol"
                className="w-full"
              />
            </div>

            {/* Confirm button with keyboard support */}
            <Button
              ref={buttonRef}
              label={confirmLabel}
              variant="brand"
              onClick={handleConfirm}
              radius="lg"
              className="w-full py-2 sm:py-3 text-sm sm:text-base mt-4 sm:mt-6"
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        {/* Vertical divider - Desktop only */}
        <div className="hidden lg:block w-px bg-slate-200 mx-2" />

        {/* Right column - Privileges checklist table */}
        <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
          <div className="bg-white rounded-lg border border-slate-200 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto p-2 sm:p-3
            [&::-webkit-scrollbar]:w-2 sm:[&::-webkit-scrollbar]:w-3
            [&::-webkit-scrollbar-track]:bg-slate-100
            [&::-webkit-scrollbar-track]:rounded-lg
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar-thumb]:rounded-lg
            [&::-webkit-scrollbar-thumb]:hover:bg-slate-400">
            
            {/* Mobile header for table section */}
            <div className="lg:hidden mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-700 text-center">
                Lista de Permisos
              </h3>
            </div>
            
            {/* Privileges data table */}
            <DataTable 
              columns={tableColumns} 
              data={tableDataWithIndex}
              className="text-xs sm:text-sm"
            />
          </div>
          
          {/* Mobile select all button */}
          {tableData.length > 0 && (
            <div className="lg:hidden mt-3 flex justify-center">
              <Button
                label={allSelected ? "Deseleccionar Todos" : "Seleccionar Todos"}
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