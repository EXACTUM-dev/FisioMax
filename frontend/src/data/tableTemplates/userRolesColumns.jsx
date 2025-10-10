/**
 * @fileoverview Template para las columnas de la tabla de usuarios.
 * Define las columnas para mostrar información de usuarios, incluyendo nombre, rol,
 * estado de membresía y una acción para eliminar.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";
import RolePicker from "../../molecules/rolePicker";
import trashIcon from "../../assets/icons/trash-2.png";

/**
 * Genera las columnas para la tabla de usuarios.
 * @param {Object} options - Opciones para configurar las columnas.
 * @param {Array} options.roles - Lista de roles disponibles para asignar.
 * @param {Function} options.onDelete - Callback para manejar la eliminación de un usuario.
 * @param {Function} options.onChangeRole - Callback para manejar el cambio de rol de un usuario.
 * @returns {Array} - Configuración de columnas para la tabla.
 */
export function buildUserRolesColumns({ roles = [], onDelete, onChangeRole } = {}) {
  return [
    {
      key: "nombre", // Identificador único de la columna
      label: "Nombre", // Etiqueta visible en la tabla
      className: "w-[40%]", // Clase CSS para el ancho de la columna
      render: (row) => row?.nombre || row?.name || `${row?.nombres || ''} ${row?.apellidoP || ''}`.trim(),
    },
    {
      key: "rol",
      label: "Rol",
      className: "w-[20%] text-center",
      render: (row) => (
        // Componente interactivo para seleccionar roles
        <RolePicker row={row} roles={roles} onSelect={(r) => onChangeRole?.(row, r)} />
      ),
    },
    {
      key: "membresia",
      label: "Estado membresía",
      className: "w-[20%] text-center",
      render: (row) => row?.membresia || row?.membership?.status || row?.estado || "",
    },
    {
      key: "eliminar",
      label: "Eliminar",
      className: "w-[20%] text-right",
      isAction: true, // Indica que esta columna contiene acciones
      render: (row) => (
        <button
          type="button"
          title="Eliminar"
          onClick={() => onDelete?.(row)}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50"
        >
          <img src={trashIcon} alt="Eliminar" className="w-5 h-5 object-contain opacity-80" />
        </button>
      ),
    },
  ];
}

export default buildUserRolesColumns;
