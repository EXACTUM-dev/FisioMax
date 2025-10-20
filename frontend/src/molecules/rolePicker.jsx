/**
 * @fileoverview Role selection component.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Modal from './modal';
import Button from '../atoms/button';
import ConfirmationModal from './confirmationModal';
import { fetchWithClerk } from '../utils/api';

/**
 * RolePicker component for managing user roles.
 * Displays a button that opens a modal with a dropdown to select from available roles.
 * @param {Object} props Component properties.
 * @param {Object} props.row User data associated with the role.
 * @param {Array} props.roles Array of available roles to choose from.
 * @param {Function} props.onSelect Callback when a role is selected.
 * @returns {JSX.Element} Role selection component.
 */
export default function RolePicker({ row, roles = [], onSelect }) {
  const { getToken } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Handles closing the dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [dropdownOpen]);

  // Determines the current user role
  const current =
    row?.rol || 
    row?.rolNombre || 
    row?.role || 
    (Array.isArray(row?.roles) && row.roles[0]?.name) || 
    row?.roleName ||
    '';

  // Get user name
  const userName = row?.nombre || row?.name || 'Usuario';

  // Handle opening modal
  const handleOpenModal = () => {
    setSelectedRole(current);
    setModalOpen(true);
  };

  // Handle role selection in dropdown
  const handleSelectRole = (role) => {
    const roleName = role?.nombre || role?.name || role?.rol || role;
    setSelectedRole(roleName);
    setDropdownOpen(false);
  };

  // Handle confirm button
  const handleConfirm = () => {
    if (selectedRole && selectedRole !== current) {
      // Open confirmation modal instead of directly saving
      setConfirmModalOpen(true);
    } else {
      setModalOpen(false);
    }
  };

  // Handle confirmation of role change
  const handleConfirmRoleChange = async () => {
    setConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      // Find the full role object
      const roleObj = roles.find(r => 
        (r?.nombre || r?.name || r?.rol) === selectedRole
      );

      const userId = row?.id || row?.IDUsuario;
      const roleId = roleObj?.id || roleObj?.IDRol;

      if (!userId) {
        console.error("User ID not found");
        alert("Error: No se pudo identificar el usuario");
        return;
      }

      // Call backend API to update user role
      const token = await getToken();
      const response = await fetchWithClerk(
        `/api/usuarios/${userId}/rol`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            roleId: roleId,
            roleName: selectedRole 
          }),
        },
        token
      );

      if (response && response.success) {
        // Call the onSelect callback to update UI
        onSelect?.(roleObj || selectedRole);
        setModalOpen(false);
        
        // Show success message
        console.log("Rol actualizado exitosamente");
      } else {
        throw new Error(response?.error || "Error al actualizar el rol");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error al actualizar el rol. Por favor, intenta nuevamente.");
      // Revert selection
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

  return (
    <>
      {/* Button to open modal */}
      <button
        type="button"
        onClick={handleOpenModal}
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
        "
      >
        {current || 'Asignar rol'}
      </button>

      {/* Modal for role selection */}
      <Modal
        open={modalOpen}
        onClose={handleCancel}
        size="md"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Cambiar Rol de Usuario
          </h2>

          {/* Role selection dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seleccionar Rol
            </label>
            
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="
                  w-full
                  px-4 py-2.5
                  rounded-lg 
                  font-medium 
                  text-sm
                  transition-all 
                  duration-200
                  bg-white
                  border border-slate-300
                  text-slate-700 
                  hover:border-slate-400
                  hover:bg-slate-50
                  shadow-sm
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-brand/50 
                  focus:border-brand
                  flex items-center justify-between
                "
              >
                <span className="truncate">{selectedRole || 'Selecciona un rol'}</span>
                {/* Chevron icon */}
                <svg 
                  className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="
                  absolute 
                  z-50 
                  mt-2 
                  w-full
                  bg-white 
                  rounded-lg 
                  shadow-lg 
                  border 
                  border-slate-200
                  max-h-60
                  overflow-y-auto
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-slate-100
                  [&::-webkit-scrollbar-track]:rounded-lg
                  [&::-webkit-scrollbar-thumb]:bg-slate-300
                  [&::-webkit-scrollbar-thumb]:rounded-lg
                  [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
                ">
                  {roles.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      No hay roles disponibles
                    </div>
                  ) : (
                    roles.map((role) => {
                      const roleName = role?.nombre || role?.name || role?.rol || role;
                      const isSelected = roleName === selectedRole;
                      
                      return (
                        <button
                          key={role?.id || role?.IDRol || roleName}
                          type="button"
                          onClick={() => handleSelectRole(role)}
                          className={`
                            w-full 
                            text-left 
                            px-4 
                            py-2.5
                            text-sm
                            transition-colors
                            hover:bg-slate-50
                            ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}
                            flex items-center justify-between
                            first:rounded-t-lg
                            last:rounded-b-lg
                          `}
                        >
                          <span>{roleName}</span>
                          {isSelected && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
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
    </>
  );
}
