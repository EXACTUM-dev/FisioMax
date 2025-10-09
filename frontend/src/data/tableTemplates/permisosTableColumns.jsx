/**
 * @fileoverview Plantilla de columnas para tabla de permisos
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';

/**
 * Construye las columnas para la tabla de permisos
 * @returns {Array} Array de columnas para la tabla
 */
export default function buildPermisosTableColumns() {
  return [
    {
      key: "permiso",
      label: "PERMISO",
      className: "w-[30%]",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.permiso}
        </div>
      ),
    },
    {
      key: "descripcion",
      label: "DESCRIPCIÓN",
      className: "w-[70%]",
      render: (row) => (
        <div className="text-gray-700">
          {row.descripcion}
        </div>
      ),
    },
  ];
}
