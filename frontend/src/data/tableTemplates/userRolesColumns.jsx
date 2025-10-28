/**
 * @fileoverview Template for user table columns.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";
import RolePicker from "../../molecules/rolePicker";
import trashIcon from "../../assets/icons/trash-2.png";

/**
 * Builds the column configuration for the users table.
 * Defines columns for displaying user information including name, role,
 * membership status, and a delete action.
 * @param {Object} options Configuration options for the columns.
 * @param {Array} options.roles List of available roles to assign.
 * @param {Function} options.onDelete Callback to handle user deletion.
 * @param {Function} options.onChangeRole Callback to handle user role changes.
 * @param {Function} options.onClickName Callback to handle clicking on user name.
 * @returns {Array} Column configuration for the table.
 */
export function buildUserRolesColumns({ roles = [], onDelete, onChangeRole, onClickName } = {}) {
  return [
    {
      key: "nombre", // Unique column identifier
      label: "Nombre", // Visible label in the table
      className: "w-[40%]", // CSS class for column width
      render: (row) => {
        // Try to build full name with nombres, apellidoP and apellidoM
        const nombreCompleto = `${row?.nombres || ''} ${row?.apellidoP || ''} ${row?.apellidoM || ''}`.trim();
        const displayName = nombreCompleto || row?.nombre || row?.name || '';
        
        return (
          <button
            type="button"
            onClick={() => onClickName?.(row)}
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
            title="Ver perfil"
          >
            {displayName}
          </button>
        );
      },
    },
    {
      key: "rol",
      label: "Rol",
      className: "w-[20%] text-center",
      render: (row) => (
        // Interactive component to select roles
        <RolePicker row={row} roles={roles} onSelect={(r) => onChangeRole?.(row, r)} />
      ),
    },
    {
      key: "membresia",
      label: "Estado membresía",
      className: "w-[20%] text-center",
      render: (row) => row?.membresia || row?.membership?.status || row?.estado || "",
    },
    {
      key: "eliminar",
      label: "Eliminar",
      className: "w-[20%] text-right",
      isAction: true, // Indicates this column contains actions
      render: (row) => (
        <button
          type="button"
          title="Eliminar"
          onClick={() => onDelete?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50"
        >
          <img src={trashIcon} alt="Eliminar" className="w-5 h-5 object-contain opacity-80" />
        </button>
      ),
    },
  ];
}

export default buildUserRolesColumns;
