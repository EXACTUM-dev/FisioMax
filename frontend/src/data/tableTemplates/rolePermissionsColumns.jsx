/**
 * Version: 1.1.0
 * Column factory for a roles/permissions table
 * Keeps DataTable generic; only columns define labels, renders and mobile behavior
 * Prevents default navigation behavior for action columns
 */
import React from "react";
import trashIcon from "../../assets/icons/trash-2.png";
import editIcon from "../../assets/icons/square-pen.png";

/**
 * Build columns for: Rol, Permisos, Editar, Eliminar
 * Handlers are optional and receive the full row.
 */
export function buildRolePermissionsColumns({ onEdit, onDelete } = {}) {
  return [
    {
      key: "rol",
      label: "Rol",
      className: "w-[30%]",
    },
    {
      key: "permisos",
      label: "descripción",
      className: "w-[40%]",
      // Renders a list of permissions as compact badges (supports string or array)
      render: (row) => {
        const value = row?.permisos;
        const list = Array.isArray(value)
          ? value
          : typeof value === "string" && value.length
          ? value.split(",").map((s) => s.trim())
          : [];
        if (list.length === 0)
          return <span className="text-slate-500">N/A</span>;
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
    {
      key: "editar",
      label: "Editar",
      className: "w-[10%] text-right",
      isAction: true,
      render: (row) => (
        <button
          type="button"
          title="Editar"
          onClick={(e) => {
            // Prevent default navigation
            e.preventDefault();
            e.stopPropagation();
            // Call the edit handler
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
            // Prevent default navigation
            e.preventDefault();
            e.stopPropagation();
            // Call the delete handler
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
