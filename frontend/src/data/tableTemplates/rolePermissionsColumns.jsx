/**
 * Author: Mauricio Salas
 * Version: 1.1.0
 * Column factory for a roles/permissions table
 * Keeps DataTable generic; only columns define labels, renders and mobile behavior
 * Prevents default navigation behavior for action columns
 */

import React from "react";
import trashIcon from "../../assets/icons/trash-2.png";
import editIcon from "../../assets/icons/square-pen.png";

/**
 * Build columns for roles/permissions table with Rol, Permisos, Editar, Eliminar
 * @function
 * @param {Object} options - Configuration options
 * @param {Function} [options.onEdit] - Edit handler function that receives the full row data
 * @param {Function} [options.onDelete] - Delete handler function that receives the full row data
 * @returns {Array<Object>} Array of column configuration objects for DataTable
 */
export function buildRolePermissionsColumns({ onEdit, onDelete } = {}) {
  return [
    // Role name column
    {
      key: "rol",
      label: "Rol",
      className: "w-[30%]",
    },
    // Permissions description column with badge rendering
    {
      key: "permisos",
      label: "descripción",
      className: "w-[40%]",
      /**
       * Renders a list of permissions as compact badges (supports string or array)
       * @param {Object} row - Table row data object
       * @param {string|Array} row.permisos - Permissions data as string or array
       * @returns {React.Element} Rendered permissions badges or N/A indicator
       */
      render: (row) => {
        const value = row?.permisos;
        // Normalize permissions data to array format
        const list = Array.isArray(value)
          ? value
          : typeof value === "string" && value.length
          ? value.split(",").map((s) => s.trim())
          : [];
        
        // Return N/A indicator if no permissions available
        if (list.length === 0)
          return <span className="text-slate-500">N/A</span>;
        
        // Render permissions as compact badge elements
        return (
          <div className="flex flex-wrap gap-1.5">
            {list.map((p, i) => (
              <span
                key={`${p}-${i}`}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {p}
              </span>
            ))}
          </div>
        );
      },
    },
    // Edit action column
    {
      key: "editar",
      label: "Editar",
      className: "w-[10%] text-right",
      isAction: true,
      /**
       * Edit action button with event prevention
       * @param {Object} row - Table row data object
       * @returns {React.Element} Edit button with icon
       */
      render: (row) => (
        <button
          type="button"
          title="Editar"
          onClick={(e) => {
            // Prevent default navigation behavior
            e.preventDefault();
            e.stopPropagation();
            // Call the edit handler with row data
            onEdit?.(row);
          }}
          className="inline-flex items-center cursor-pointer justify-center w-8 h-8 rounded hover:bg-blue-50"
        >
          <img
            src={editIcon}
            alt="Editar"
            className="w-5 h-5 object-contain opacity-80"
          />
        </button>
      ),
    },
    // Delete action column
    {
      key: "eliminar",
      label: "Eliminar",
      className: "w-[10%] text-right",
      isAction: true,
      /**
       * Delete action button with event prevention
       * @param {Object} row - Table row data object
       * @returns {React.Element} Delete button with icon
       */
      render: (row) => (
        <button
          type="button"
          title="Eliminar"
          onClick={(e) => {
            // Prevent default navigation behavior
            e.preventDefault();
            e.stopPropagation();
            // Call the delete handler with row data
            onDelete?.(row);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50"
        >
          <img
            src={trashIcon}
            alt="Eliminar"
            className="w-5 h-5 object-contain opacity-80"
          />
        </button>
      ),
    },
  ];
}

export default buildRolePermissionsColumns;