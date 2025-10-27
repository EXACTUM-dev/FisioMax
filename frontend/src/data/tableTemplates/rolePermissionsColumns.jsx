/**
 * @fileoverview Column factory for a roles/permissions table
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Keeps DataTable generic; only columns define labels, renders and mobile behavior
 * @description Prevents default navigation behavior for action columns
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
 * @param {string} [options.editLabel] - Custom label for edit column (default: "Editar Permisos")
 * @param {string} [options.editTooltip] - Custom tooltip for edit button (default: "Editar")
 * @param {boolean} [options.showDelete] - Whether to show delete column (default: true)
 * @returns {Array<Object>} Array of column configuration objects for DataTable
 */
export function buildRolePermissionsColumns({
  onEdit,
  onDelete,
  editLabel = "Editar Permisos",
  editTooltip = "Editar",
  showDelete = true,
} = {}) {
  const columns = [
    // Role name column
    {
      key: "rol",
      label: "Rol",
      className: "w-[30%] truncate max-w-xs",
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
                className="px-2 py-0.5 rounded-full text-xs font-medium text-slate-700 truncate max-w-xs"
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
      label: editLabel,
      className: showDelete ? "w-[5%] text-right" : "w-[15%] text-right",
      isAction: true,
      /**
       * Edit action button with event prevention
       * @param {Object} row - Table row data object
       * @returns {React.Element} Edit button with icon
       */
      render: (row) => (
        <button
          type="button"
          title={editTooltip}
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
            alt={editTooltip}
            className="w-5 h-5 object-contain opacity-80"
          />
        </button>
      ),
    },
  ];

  // Conditionally add delete column
  if (showDelete) {
    columns.push({
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
    });
  }

  return columns;
}

export default buildRolePermissionsColumns;
