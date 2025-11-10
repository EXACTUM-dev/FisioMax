/**
 * @fileoverview Template for user table columns.
 * @version 1.2.1
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
 * @param {Object} options Configuration options for the columns.
 * @param {Array} options.roles List of available roles to assign.
 * @param {Function} options.onDelete Callback to handle user deletion.
 * @param {Function} options.onChangeRole Callback to handle user role changes.
 * @returns {Array} Column configuration for the table.
 */
export function buildUserRolesColumns({
  roles = [],
  onDelete,
  onChangeRole,
  onView,
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

        // Responsive truncation limits
        const getTruncateLimit = () => {
          if (window.innerWidth >= 1024) return 30;
          if (window.innerWidth >= 768) return 20;
          return 15;
        };

        const roleTruncated = truncateText(roleName, getTruncateLimit());

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
          Pendiente: "text-yellow-700 font-bold",
          Pagado: "text-green-700 font-bold",
          Vencido: "text-red-700 font-bold",
        };

        return (
          <span
            className={`
          text-xs sm:text-sm font-bold
          ${estadoColors[normalizedStatus] || "text-gray-700 font-bold"}
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
            className="w-5 h-5 cursor-pointer object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </button>
      ),
    },
    {
      key: "ver",
      label: "Ver",
      className: "w-[8%]",
      headAlign: "center",
      align: "center",
      isAction: true,
      render: (row) => (
        <div className="flex items-center justify-center w-full h-full">
          <button
            type="button"
            title="Ver usuario"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(row);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];
}

export default buildUserRolesColumns;
