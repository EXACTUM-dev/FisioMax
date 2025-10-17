/**
 * @fileoverview Modal component for role modification with privilege checklist.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState } from "react";
import Modal from "../molecules/modal";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";
import ConfirmModal from "../molecules/confirmationModal";

/**
 * ChecklistModal component for modifying roles with privilege selection.
 * Displays a modal with a role name input and a checklist of privileges.
 * @param {Object} props Component properties.
 * @param {boolean} props.open Whether the modal is open or not.
 * @param {string} [props.title="Modificar Rol"] Modal title.
 * @param {string} [props.roleName="Administrador"] Initial role name.
 * @param {Array} [props.roles=[]] Array of role objects with {id, nombre, checked}.
 * @param {string} [props.confirmLabel="Modificar Rol"] Confirm button text.
 * @param {Function} props.onConfirm Callback function called with (roleName, selectedPrivileges).
 * @param {Function} props.onClose Callback function to close the modal.
 * @returns {JSX.Element|null} Checklist modal component or null if not open.
 */
export default function ChecklistModal({
  open,
  title = "Modificar Rol",
  roleName: initialRoleName = "Administrador",
  roles = [], // Dynamically passed roles
  confirmLabel = "Modificar Rol",
  onConfirm,
  onClose,
}) {
  const [roleName, setRoleName] = useState(initialRoleName);
  const [checkedPrivileges, setCheckedPrivileges] = useState(
    roles.reduce((acc, role) => {
      acc[role.id] = role.checked ?? true;
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
  };

  return (
    <Modal open={open} onClose={onClose} size="xl" className="p-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
        <div className="flex-1 min-w-[320px] flex flex-col justify-center">
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
            onClick={handleConfirm}
            radius="lg"
            className="w-full py-3 text-base"
          />
        </div>
        <div className="flex-1 min-w-[320px]">
          <DataTable
            columns={[{ key: "label", label: "Permiso", headAlign: "left", align: "left" }]}
            data={roles.map((role) => ({ id: role.id, label: role.nombre, checked: checkedPrivileges[role.id] }))}
          />
        </div>
      </div>
    </Modal>
  );
}