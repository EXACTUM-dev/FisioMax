/**
 * Version: 1.0.0
 * Column factory for users table showing role, membership state and delete action
 */
import React from "react";
import RolePicker from "../../molecules/rolePicker";
import trashIcon from "../../assets/icons/trash-2.png";

export function buildUserRolesColumns({ roles = [], onDelete, onChangeRole } = {}) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      className: "w-[40%]",
      render: (row) => row?.nombre || row?.name || `${row?.nombres || ''} ${row?.apellidoP || ''}`.trim(),
    },
    {
      key: "rol",
      label: "Rol",
      className: "w-[20%] text-center",
      render: (row) => (
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
      isAction: true,
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
