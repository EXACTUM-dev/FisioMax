/**
 * @fileoverview Role selection component.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useRef, useEffect } from 'react';
import ChecklistModal from '../organisms/checklistModal';

/**
 * RolePicker component for managing user roles.
 * Displays the current role of a user and allows opening a modal
 * to manage or assign a new role using the ChecklistModal component.
 * @param {Object} props Component properties.
 * @param {Object} props.row User data associated with the role.
 * @param {Function} props.onOpenPopup Optional callback to handle popup opening.
 * @returns {JSX.Element} Role selection component.
 */
export default function RolePicker({ row, onOpenPopup }) {
  const [open, setOpen] = useState(false); // State to handle dropdown (not currently used)
  const ref = useRef(null); // Reference to handle clicks outside the component
  const [isModalOpen, setModalOpen] = useState(false); // State to handle modal visibility

  // Handles closing the dropdown when clicking outside the component
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Determines the current user role
  const current =
    row?.rol || row?.role || (Array.isArray(row?.roles) && row.roles[0]?.name) || row?.correo || '';

  // Opens the modal
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Closes the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirm = (roleName, selectedPrivileges) => {
    console.log('Nuevo rol:', roleName);
    console.log('Privilegios seleccionados:', selectedPrivileges);
    setModalOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {/* Clickable text to open the modal */}
      <span
        onClick={handleOpenModal}
        className="cursor-pointer hover:opacity-80 text-left block"
      >
        {current || 'Asignar rol'}
      </span>

      {/* Modal to manage roles */}
      <ChecklistModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        roleName={current}
      />
    </div>
  );
}
