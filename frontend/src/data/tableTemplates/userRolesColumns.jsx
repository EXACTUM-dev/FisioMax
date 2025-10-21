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
 * @returns {Array} Column configuration for the table.
 */
export function buildUserRolesColumns({ roles = [], onDelete, onChangeRole } = {}) {
  return [
    {
      key: "nombre", // Unique column identifier
      label: "Nombre", // Visible label in the table
      className: "w-[40%]", // CSS class for column width
      render: (row) => {
        // Try to build full name with nombres, apellidoP and apellidoM
        const nombreCompleto = `${row?.nombres || ''} ${row?.apellidoP || ''} ${row?.apellidoM || ''}`.trim();
        return nombreCompleto || row?.nombre || row?.name || '';
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
