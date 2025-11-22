/**
 * @fileoverview Modal component for role modification with privilege checklist and validation
 * @author EXACTUM-dev
 * @version 0.2.1
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import Button from "../../atoms/button";
import { Title2 } from "../../atoms/typography";
import FormField from "../../molecules/form";
import DataTable from "../../organisms/dataTable";
import Modal from "../../molecules/modal";
import CheckBox from "../../atoms/checkBox";
import { areArraysSameSet } from "../../utils/validationUtils";
import { usePrivileges } from "../../hooks/usePrivileges";
import {
  ROLE_FIELD_MAX_LENGTHS,
  ROLE_VALIDATION_RULES,
  validateRoleForm,
  validateUniqueRoleName,
  hasRoleErrors,
  sanitizeRoleField,
} from "../../utils/roleValidation";

/**
 * RoleModalContent component for creating or editing roles with privilege selection.
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {string} [props.title] - Title of the modal
 * @returns {JSX.Element} The RoleModalContent component
 */

function RoleModalContent({
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
  const [formData, setFormData] = useState({
    nombre: initialDataName,
    descripcion: initialDataDescription,
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    checkedPrivileges,
    allSelected,
    handleToggle,
    handleSelectAll,
    currentSelectedIds,
  } = usePrivileges(tableData);

  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFormData({
        nombre: initialDataName,
        descripcion: initialDataDescription,
      });
      setErrors({});
      setIsProcessing(false);
    }
  }, [open, initialDataName, initialDataDescription]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeRoleField(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (ROLE_VALIDATION_RULES[name]) {
      const fieldErrors = validateRoleForm({
        [name]: sanitizedValue,
      });
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name],
      }));
    }

    if (name === "nombre" && sanitizedValue.trim()) {
      const duplicateError = validateUniqueRoleName(
        sanitizedValue,
        existingData,
        currentDataId
      );
      if (duplicateError) {
        setErrors((prev) => ({
          ...prev,
          nombre: duplicateError,
        }));
      }
    }
  };

  const handleConfirm = async () => {
    const selectedPrivileges = currentSelectedIds;

    const formErrors = validateRoleForm({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      privilegios: selectedPrivileges,
    });

    const duplicateError = validateUniqueRoleName(
      formData.nombre,
      existingData,
      currentDataId
    );

    if (duplicateError) {
      formErrors.nombre = duplicateError;
    }

    setErrors(formErrors);

    if (hasRoleErrors(formErrors) || duplicateError) {
      return;
    }

    setIsProcessing(true);

    try {
      await onConfirm?.(
        formData.nombre.trim(),
        formData.descripcion.trim(),
        selectedPrivileges
      );
    } catch (error) {
      console.error("Error in onConfirm:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const initialSelectedIds = useMemo(
    () => (tableData || []).filter((p) => !!p.checked).map((p) => String(p.id)),
    [tableData]
  );

  const isDirty = useMemo(() => {
    const nameChanged =
      (formData.nombre || "").trim() !== (initialDataName || "").trim();
    const descChanged =
      (formData.descripcion || "").trim() !==
      (initialDataDescription || "").trim();
    const privsChanged = !areArraysSameSet(
      currentSelectedIds,
      initialSelectedIds
    );

    if (currentDataId == null) {
      const hasAnyInput =
        (formData.nombre || "").trim() !== "" ||
        (formData.descripcion || "").trim() !== "" ||
        currentSelectedIds.length > 0;
      return hasAnyInput;
    }

    return nameChanged || descChanged || privsChanged;
  }, [
    formData.nombre,
    formData.descripcion,
    initialDataName,
    initialDataDescription,
    currentSelectedIds,
    initialSelectedIds,
    currentDataId,
  ]);

  const isConfirmDisabled = hasRoleErrors(errors) || isProcessing;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="x2"
      requireConfirmation={isDirty}
    >
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1 min-w-0 flex flex-col">
          <Title2 className="mb-4 sm:mb-6 lg:mb-8 text-lg sm:text-xl lg:text-2xl text-center">
            {title}
          </Title2>

          <FormField
            ref={inputRef}
            label="Nombre del Rol"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Moderador, Editor, etc."
            maxLength={ROLE_FIELD_MAX_LENGTHS.nombre}
            required
            error={errors.nombre}
            disabled={isProcessing}
          />

          <FormField
            label="Descripción del Rol"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Describe las responsabilidades de este rol"
            maxLength={ROLE_FIELD_MAX_LENGTHS.descripcion}
            multiline
            rows={4}
            error={errors.descripcion}
            disabled={isProcessing}
          />

          {errors.privilegios && (
            <p className="text-sm text-red-500 mt-2 mb-4">
              {errors.privilegios}
            </p>
          )}

          <Button
            label={isProcessing ? "Procesando..." : confirmLabel}
            variant="brand"
            onClick={handleConfirm}
            radius="lg"
            className="w-full py-2 sm:py-3 text-sm sm:text-base mt-4 sm:mt-6"
            disabled={isConfirmDisabled}
          />
        </div>

        <div className="hidden lg:block w-px bg-slate-200 mx-2" />

        <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3">
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
                        disabled={isProcessing}
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
                        disabled={isProcessing}
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
                disabled={isProcessing}
              />
            </div>
          )}

          {currentSelectedIds.length > 0 && !errors.privilegios && (
            <p className="text-xs text-slate-500 mt-2 text-center lg:text-left">
              {currentSelectedIds.length}{" "}
              {currentSelectedIds.length === 1
                ? "privilegio seleccionado"
                : "privilegios seleccionados"}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function RoleModal(props) {
  if (!props.open) return null;
  return <RoleModalContent {...props} />;
}
