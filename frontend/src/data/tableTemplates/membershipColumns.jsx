/**
 * @fileoverview Template for membership requests table columns.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";
import applicationIcon from "../../assets/icons/carta.png";

/**
 * Builds the column configuration for the membership requests table.
 * Defines columns for displaying membership information including name, status, and date.
 * @param {Object} options Configuration options for the columns.
 * @param {Function} options.onApprove Callback to handle membership approval (optional).
 * @param {Function} options.onReject Callback to handle membership rejection (optional).
 * @param {Function} options.onView Callback to handle viewing membership details (optional).
 * @returns {Array} Column configuration for the table.
 */
export function buildMembershipColumns({ onView} = {}) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      className: "w-[40%]",
      headAlign: "left",
      align: "left",
      render: (row) => (
        <span className="text-sm sm:text-base">
          {row?.nombre || row?.name || ''}
        </span>
      ),
    },
    
    {
      key: "estado",
      label: "Estado",
      className: "w-[25%]",
      headAlign: "center",
      align: "center",
      render: (row) => {
        const estadoColors = {
          'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
          'Aprobado': 'bg-green-100 text-green-800 border-green-200',
          'Rechazado': 'bg-red-100 text-red-800 border-red-200',
          'En Revisión': 'bg-blue-100 text-blue-800 border-blue-200',
        };
        
        const estado = row?.estado || row?.status || 'Pendiente';
        
        return (
          <span 
            className={`
              inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium border
              ${estadoColors[estado] || 'bg-gray-100 text-gray-800 border-gray-200'}
            `}
          >
            {estado}
          </span>
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
        const fecha = row?.fecha || row?.date || '';
        
        // Format date if needed
        if (fecha) {
          try {
            const dateObj = new Date(fecha);
            return (
              <span className="text-sm text-slate-600">
                {dateObj.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
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
        label: "Ver solicitud",
        className: "w-[20%] text-right",
        isAction: true,
        render: (row) => (
            <button
            type="button"
            title="Ver solicitud"
            onClick={() => onView?.(row)}
            className="
                px-4 py-2 
                rounded-lg 
                font-medium 
                text-sm
                transition-all 
                duration-200
                bg-slate-100 
                text-slate-700 
                hover:bg-slate-200 
                hover:shadow-md
                hover:scale-105
                shadow-sm
                focus:outline-none 
                focus:ring-2 
                focus:ring-brand/50 
                focus:ring-offset-1
                active:scale-95
            "
            >
            <img 
                src={applicationIcon} 
                alt="Ver" 
                className="w-5 h-5 object-contain opacity-80 hover:opacity-100 transition-opacity" 
            />
            </button>
        ),
    }
  ];
  
}

export default buildMembershipColumns;