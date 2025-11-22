/**
 * @fileoverview Role selection component.
 * @version 1.2.1
 * @author EXACTUM-dev
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import Modal from "./modal";
import Button from "../atoms/button";
import Dropdown from "./dropdown";
import ConfirmationModal from "./confirmationModal";
import SuccessErrorModal from "../organisms/successErrorModal";
import { fetchWithClerk } from "../utils/api";

/**
 * RolePicker component for managing user roles.
 * Displays a button that opens a modal with a dropdown to select from available roles.
 * @param {Object} props Component properties.
 * @param {Object} props.row User data associated with the role.
 * @param {Array} props.roles Array of available roles to choose from.
 * @param {Function} props.onSelect Callback when a role is selected.
 * @param {string} [props.displayName] Optional custom display name for the button.
 * @returns {JSX.Element} Role selection component.
 */
export default function RolePicker({ row, roles = [], onSelect, displayName }) {
  const { getToken } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Success/Error modal states
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Determines the current user role
  const current =
    row?.rol ||
    row?.rolNombre ||
    row?.role ||
    (Array.isArray(row?.roles) && row.roles[0]?.name) ||
    row?.roleName ||
    "";

  // Get user name
  const userName = row?.nombre || row?.name || "Usuario";

  // Handle opening modal
  const handleOpenModal = () => {
    setSelectedRole(current);
    setModalOpen(true);
  };

  // Handle role selection in dropdown
  const handleSelectRole = (e) => {
    setSelectedRole(e.target.value);
  };

  // Handle confirm button
  const handleConfirm = () => {
    if (selectedRole && selectedRole !== current) {
      setConfirmModalOpen(true);
    } else {
      setModalOpen(false);
    }
  };

  /**
   * Handles confirmation and execution of role change.
   */
  const handleConfirmRoleChange = async () => {
    setConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const roleObj = roles.find(
        (r) => (r?.nombre || r?.name || r?.rol) === selectedRole
      );

      const userId = row?.id || row?.IDUsuario;
      const roleId = roleObj?.id || roleObj?.IDRol;

      if (!userId) {
        setErrorMessage("No se pudo identificar el usuario");
        setErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (!roleId) {
        setErrorMessage("No se pudo identificar el rol");
        setErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      const token = await getToken();
      const response = await fetchWithClerk(
        `/api/users/${userId}/rol`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleId: roleId,
            roleName: selectedRole,
          }),
        },
        token
      );

      if (response?.success) {
        const roleToUpdate = roleObj || {
          id: roleId,
          IDRol: roleId,
          nombre: selectedRole,
          name: selectedRole,
        };

        onSelect?.(roleToUpdate);
        setModalOpen(false);
        setSuccessModalOpen(true);
      } else {
        throw new Error(response?.error || "Error al actualizar el rol");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setErrorMessage(
        error.message ||
          "Error al actualizar el rol. Por favor, intenta nuevamente."
      );
      setErrorModalOpen(true);
      setSelectedRole(current);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel of confirmation
  const handleCancelConfirmation = () => {
    setConfirmModalOpen(false);
  };

  // Handle cancel button
  const handleCancel = () => {
    setSelectedRole(current);
    setModalOpen(false);
  };

  // Full text for tooltip
  const buttonText = displayName || current || "Asignar rol";

  return (
    <>
      {/* Button to open modal - con stopPropagation para evitar activar onRowClick */}
      <div onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleOpenModal}
          title={buttonText}
          className="
            px-4 py-2 
            rounded-lg 
            font-medium 
            text-sm
            transition-all 
            duration-200
            bg-slate-100 
            text-slate-700 
            hover:bg-slate-200 
            shadow-sm
            focus:outline-none 
            focus:ring-2 
            focus:ring-brand/50 
            focus:ring-offset-1
            active:scale-95
            cursor-pointer
            max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-full
          "
        >
          <span className="block truncate">{buttonText}</span>
        </button>
      </div>

      {/* Modal for role selection */}
      <Modal open={modalOpen} onClose={handleCancel} size="md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Cambiar Rol de Usuario
          </h2>

          {/* Role selection dropdown */}
          <div className="mb-6">
            <Dropdown
              name="role"
              label="Seleccionar Rol"
              value={selectedRole || ""}
              onChange={handleSelectRole}
              options={roles.map((role) => ({
                value: role?.nombre || role?.name || role?.rol || role,
                label: role?.nombre || role?.name || role?.rol || role,
              }))}
              placeholder="Selecciona un rol"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-8">
            <Button
              label="Cancelar"
              variant="outline"
              onClick={handleCancel}
              radius="lg"
              disabled={isLoading}
            />
            <Button
              label={isLoading ? "Guardando..." : "Guardar Cambios"}
              variant="brand"
              onClick={handleConfirm}
              radius="lg"
              disabled={!selectedRole || selectedRole === current || isLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmModalOpen}
        title="¿Confirmar cambio de rol?"
        message={`¿Estás seguro de que deseas cambiar el rol de "${userName}" de "${current}" a "${selectedRole}"?`}
        confirmLabel={isLoading ? "Guardando..." : "Confirmar"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRoleChange}
        onCancel={handleCancelConfirmation}
      />

      {/* Success Modal */}
      <SuccessErrorModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        type="success"
        title="¡Rol actualizado exitosamente!"
        message={`El rol de ${userName} ha sido cambiado a ${selectedRole}.`}
        confirmLabel="Entendido"
      />

      {/* Error Modal */}
      <SuccessErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        type="error"
        title="Error al actualizar rol"
        message={errorMessage}
        confirmLabel="Cerrar"
      />
    </>
  );
}
