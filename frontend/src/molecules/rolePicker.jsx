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
    row?.rol || 
    row?.rolNombre || 
    row?.role || 
    (Array.isArray(row?.roles) && row.roles[0]?.name) || 
    row?.roleName ||
    '';

  // Opens the modal
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Closes the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirm = (roleName, selectedPrivileges) => {
    setModalOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {/* Clickable button to open the modal */}
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
