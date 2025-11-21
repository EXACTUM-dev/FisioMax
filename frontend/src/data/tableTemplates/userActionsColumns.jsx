/**
 * Version: 1.0.0
 * Column factory for a user review/actions table
 * Keeps DataTable generic; only columns define labels, renders and mobile behavior
 */
import React from "react";
import pdfIcon from "../../assets/icons/pdf.png";
import trashIcon from "../../assets/icons/trash-2.png";
import checkIcon from "../../assets/icons/circle-check.png";

/**
 * Build columns for: Nombre, Correo, Documentos, Aceptar, Eliminar
 * Handlers are optional and receive the full row.
 */
export function buildUserActionsColumns({
  onOpenDocument,
  onAccept,
  onDelete,
} = {}) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      className: "w-[30%]",
    },
    {
      key: "correo",
      label: "Correo",
      className: "w-[30%]",
    },
    {
      key: "documentos",
      label: "Documentos",
      className: "w-[10%] text-right",
      isAction: true,
      render: (row) => (
        <button
          type="button"
          title="Abrir documento"
          onClick={() => onOpenDocument?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-100"
        >
          <img src={pdfIcon} alt="PDF" className="w-5 h-5 object-contain" />
        </button>
      ),
    },
    {
      key: "aceptar",
      label: "Aceptar",
      className: "w-[10%] text-right",
      isAction: true,
      render: (row) => (
        <button
          type="button"
          title="Aceptar"
          onClick={() => onAccept?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-green-50"
        >
          <img
            src={checkIcon}
            alt="Aceptar"
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
          onClick={() => onDelete?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-red-50"
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

export default buildUserActionsColumns;
