/**
 * Version: 1.2.0
 * Column factory for privileges table
 * Muestra: Permiso, Descripción, Categoría, Editar, Eliminar
 * FIX: Agregado control de búsqueda y manejo de datos vacíos
 */
import React from "react";
import trashIcon from "../../assets/icons/trash-2.png";
import editIcon from "../../assets/icons/square-pen.png";

/**
 * Build columns for privileges table
 * @param {Object} options - Configuration options
 * @param {Function} options.onEdit - Edit handler (receives row)
 * @param {Function} options.onDelete - Delete handler (receives row)
 * @returns {Array} Column configuration array
 */
export function privilegesTable({ onEdit, onDelete } = {}) {
  return [
    {
      key: "name",
      label: "Permisos",
      className: "w-[25%]",
      searchable: true,
      searchAccessor: (row) => row?.name || row?.permisos || "",
      render: (row) => {
        const name = row?.name || row?.permisos || row?.nombre || "Sin nombre";
        return (
          <span className="font-medium text-gray-900">
            {name}
          </span>
        );
      },
    },
    {
      key: "descripcion",
      label: "Descripción",
      className: "w-[35%]",
      searchable: false,
      render: (row) => {
        const desc = row?.descripcion || row?.description || "Sin descripción";
        return (
          <span className="text-gray-700">
            {desc}
          </span>
        );
      },
    },
    
    {
      key: "editar",
      label: "Editar",
      className: "w-[12.5%] text-right",
      isAction: true,
      searchable: false,
      render: (row) => (
        <button
          type="button"
          title="Editar"
          onClick={() => onEdit?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50 transition-colors"
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
      className: "w-[12.5%] text-right",
      isAction: true,
      searchable: false,
      render: (row) => (
        <button
          type="button"
          title="Eliminar"
          onClick={() => onDelete?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50 transition-colors"
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

export default privilegesTable;