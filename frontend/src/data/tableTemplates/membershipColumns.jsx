/**
 * @fileoverview Template for membership requests table columns.
 * @version 0.2.0
 * @author EXACTUM-dev
 */

import React from "react";
import applicationIcon from "../../assets/icons/carta.png";

function truncateText(text = "", maxChars) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * Builds the column configuration for the membership requests table.
 * Defines columns for displaying membership information including name, status, and date.
 * @param {Object} options Configuration options for the columns.
 * @param {Function} options.onView Callback to handle viewing membership details (optional).
 * @returns {Array} Column configuration for the table.
 */
export function buildMembershipColumns({ onView } = {}) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      className: "w-[40%]",
      headAlign: "left",
      align: "left",
      render: (row) => {
        const fullName = row?.nombre || row?.name || "";
        return (
          <span className="text-sm sm:text-base" title={fullName}>
            {truncateText(fullName, 25)}
          </span>
        );
      },
    },

    {
      key: "estado",
      label: "Estado",
      className: "w-[25%]",
      headAlign: "center",
      align: "center",
      render: (row) => {
        const estadoStyles = {
          Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
          Aprobado: "bg-green-100 text-green-800 border-green-300",
          Rechazado: "bg-red-100 text-red-800 border-red-300",
          "En Revisión": "bg-blue-100 text-blue-800 border-blue-300",
        };

        const estado = row?.estado || row?.status || "Pendiente";

        return (
          <div className="flex items-center justify-center w-full h-full">
            <span
              className={`
                inline-flex items-center justify-center
                px-3 py-1.5 rounded-full
                text-xs sm:text-sm font-semibold
                border
                ${estadoStyles[estado] || "bg-gray-100 text-gray-800 border-gray-300"}
              `}
            >
              {estado}
            </span>
          </div>
        );
      },
    },
    {
      key: "fecha",
      label: "Fecha",
      className: "w-[20%]",
      headAlign: "center",
      align: "center",
      render: (row) => {
        const fecha = row?.fecha || row?.date || "";

        if (fecha) {
          try {
            const dateObj = new Date(fecha);
            return (
              <span className="text-sm text-slate-600">
                {dateObj.toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            );
          } catch (e) {
            return <span className="text-sm text-slate-600">{fecha}</span>;
          }
        }

        return <span className="text-sm text-slate-400">-</span>;
      },
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
            title="Ver solicitud"
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

export default buildMembershipColumns;
