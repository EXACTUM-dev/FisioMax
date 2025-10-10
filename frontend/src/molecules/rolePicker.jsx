/**
 * @fileoverview Componente para la selección de roles.
 * Este componente muestra el rol actual de un usuario y permite abrir un modal
 * para gestionar o asignar un nuevo rol utilizando el componente ChecklistModal.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useRef, useEffect } from 'react';
import ChecklistModal from '../organisms/checklistModal';

/**
 * RolePicker
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.row - Datos del usuario asociado al rol.
 * @param {Function} props.onOpenPopup - Callback opcional para manejar la apertura del popup.
 * @returns {JSX.Element} - Componente de selección de roles.
 */
export default function RolePicker({ row, onOpenPopup }) {
  const [open, setOpen] = useState(false); // Estado para manejar el dropdown (no usado actualmente)
  const ref = useRef(null); // Referencia para manejar clics fuera del componente
  const [isModalOpen, setModalOpen] = useState(false); // Estado para manejar la visibilidad del modal

  // Maneja el cierre del dropdown al hacer clic fuera del componente
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Determina el rol actual del usuario
  const current =
    row?.rol || row?.role || (Array.isArray(row?.roles) && row.roles[0]?.name) || row?.correo || '';

  // Abre el modal
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Cierra el modal
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
      {/* Texto clickeable para abrir el modal */}
      <span
        onClick={handleOpenModal}
        className="cursor-pointer hover:opacity-80 text-left block"
      >
        {current || 'Asignar rol'}
      </span>

      {/* Modal para gestionar roles */}
      <ChecklistModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        roleName={current}
      />
    </div>
  );
}
