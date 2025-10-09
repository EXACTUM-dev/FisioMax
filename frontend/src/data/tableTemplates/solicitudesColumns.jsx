/**
 * @fileoverview Plantilla de columnas para tabla de solicitudes
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import pdfIcon from '../../assets/icons/pdf.png';
import checkIcon from '../../assets/icons/circle-check.png';
import trashIcon from '../../assets/icons/trash-2.png';

/**
 * Construye las columnas para la tabla de solicitudes
 * @param {Object} handlers - Objeto con funciones de manejo
 * @param {Function} handlers.onOpenDocument - Función para abrir documentos
 * @param {Function} handlers.onAccept - Función para aceptar solicitud
 * @param {Function} handlers.onDelete - Función para eliminar solicitud
 * @returns {Array} Array de columnas para la tabla
 */
export default function buildSolicitudesColumns({ onOpenDocument, onAccept, onDelete }) {
  return [
    {
      key: "nombre",
      label: "NOMBRE",
      className: "w-[25%]",
      render: (row) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{row.nombre}</div>
          <div className="text-sm text-gray-600">{row.descripcion}</div>
          <div className="text-sm text-gray-500">{row.correo} {row.telefono}</div>
          <div className="text-sm text-gray-500">{row.direccion}</div>
        </div>
      ),
    },
    {
      key: "documentos",
      label: "DOCUMENTOS",
      className: "w-[20%]",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.documentos?.map((doc, index) => (
            <div key={index} className="flex items-center gap-1">
              <img 
                src={pdfIcon} 
                alt="PDF" 
                className="w-4 h-4 cursor-pointer"
                onClick={() => onOpenDocument && onOpenDocument(doc)}
                title={doc.nombre}
              />
              <span className="text-xs text-red-600 font-medium">{doc.nombre}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "aceptar",
      label: "ACEPTAR",
      className: "w-[15%] text-center",
      render: (row) => (
        <button
          onClick={() => onAccept && onAccept(row)}
          className="p-2 hover:bg-green-50 rounded-full transition-colors"
          title="Aceptar solicitud"
        >
          <img src={checkIcon} alt="Aceptar" className="w-5 h-5" />
        </button>
      ),
    },
    {
      key: "eliminar",
      label: "ELIMINAR",
      className: "w-[15%] text-center",
      render: (row) => (
        <button
          onClick={() => onDelete && onDelete(row)}
          className="p-2 hover:bg-red-50 rounded-full transition-colors"
          title="Eliminar solicitud"
        >
          <img src={trashIcon} alt="Eliminar" className="w-5 h-5" />
        </button>
      ),
    },
  ];
}
