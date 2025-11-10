/**
 * @fileoverview Template for user table columns.
 * @version 1.2.0
 * @author EXACTUM-dev
 */

import React from "react";
import RolePicker from "../../molecules/rolePicker";
import trashIcon from "../../assets/icons/trash-2.png";

function truncateText(text = "", maxChars) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * Builds the column configuration for the users table.
 * Defines columns for displaying user information including name, role,
 * membership status, and a delete action.
 * @param {Object} options Configuration options for the columns.
 * @param {Array} options.roles List of available roles to assign.
 * @param {Function} options.onDelete Callback to handle user deletion.
 * @param {Function} options.onChangeRole Callback to handle user role changes.
 * @param {Function} options.onClickName Callback to handle clicking on user name (DEPRECATED - use onRowClick on DataTable).
 * @returns {Array} Column configuration for the table.
 */
export function buildUserRolesColumns({
  roles = [],
  onDelete,
  onChangeRole,
  onClickName,
} = {}) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      className: "w-[40%]",
      headAlign: "left",
      align: "left",
      render: (row) => {
        const nombreCompleto = `${row?.nombres || ""} ${row?.apellidoP || ""} ${
          row?.apellidoM || ""
        }`.trim();
        const fullName = nombreCompleto || row?.nombre || row?.name || "";

        return (
          <span
            className="text-sm sm:text-base block break-words hyphens-auto"
            lang="es"
            title={fullName}
          >
            {truncateText(fullName, 30)}
          </span>
        );
      },
    },
    {
      key: "rol",
      label: "Rol",
      className: "w-[25%]",
      headAlign: "center",
      align: "center",
      render: (row) => {
        const roleName = row?.rol || row?.rolNombre || "Sin rol asignado";
        const roleTruncated = truncateText(roleName, 25);

        return (
          <div title={roleName}>
            <RolePicker
              row={row}
              roles={roles}
              onSelect={(r) => onChangeRole?.(row, r)}
              displayName={roleTruncated}
            />
          </div>
        );
      },
    },
    {
      key: "membresia",
      label: "Estado membresía",
      className: "w-[25%]",
      headAlign: "center",
      align: "center",
      render: (row) => {
        const paymentStatus =
          row?.membershipPaymentStatus ||
          row?.membresiaEstatusPago ||
          "pendiente";

        const normalizedStatus =
          paymentStatus.charAt(0).toUpperCase() +
          paymentStatus.slice(1).toLowerCase();

        const estadoColors = {
          Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
          Pagado: "bg-green-100 text-green-800 border-green-200",
          Vencido: "bg-red-100 text-red-800 border-red-200",
        };

        return (
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium border
              ${
                estadoColors[normalizedStatus] ||
                "bg-gray-100 text-gray-800 border-gray-200"
              }
            `}
          >
            {normalizedStatus}
          </span>
        );
      },
    },
    {
      key: "eliminar",
      label: "Eliminar",
      className: "w-[10%] text-right",
      isAction: true,
      render: (row) => (
        <button
          type="button"
          title="Eliminar"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(row);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50 transition-colors"
        >
          <img
            src={trashIcon}
            alt="Eliminar"
            className="w-5 h-5 object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </button>
      ),
    },
  ];
}

export default buildUserRolesColumns;
