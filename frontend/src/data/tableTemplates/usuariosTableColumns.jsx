/**
 * @fileoverview Plantilla de columnas para tabla de usuarios con rol y estado de membresía
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import trashIcon from '../../assets/icons/trash-2.png';

/**
 * Construye las columnas para la tabla de usuarios con rol y estado de membresía
 * @param {Object} handlers - Objeto con funciones de manejo
 * @param {Function} handlers.onDelete - Función para eliminar usuario
 * @returns {Array} Array de columnas para la tabla
 */
export default function buildUsuariosTableColumns({ onDelete } = {}) {
  return [
    {
      key: "nombre",
      label: "NOMBRE",
      className: "w-[30%]",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.nombre}
        </div>
      ),
    },
    {
      key: "rol",
      label: "ROL",
      className: "w-[25%]",
      render: (row) => (
        <div className="text-gray-700">
          {row.rol}
        </div>
      ),
    },
    {
      key: "estadoMembresia",
      label: "ESTADO MEMBRESÍA",
      className: "w-[25%]",
      render: (row) => (
        <div className={`font-medium ${
          row.estadoMembresia === 'Activa' 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {row.estadoMembresia}
        </div>
      ),
    },
    {
      key: "eliminar",
      label: "ELIMINAR",
      className: "w-[20%] text-center",
      render: (row) => (
        <button
          onClick={() => onDelete && onDelete(row)}
          className="p-2 hover:bg-red-50 rounded-full transition-colors"
          title="Eliminar usuario"
        >
          <img src={trashIcon} alt="Eliminar" className="w-5 h-5" />
        </button>
      ),
    },
  ];
}
