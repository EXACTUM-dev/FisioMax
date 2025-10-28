/**
 * @fileoverview Address card component for displaying user address information.
 * Shows country, state, city, and detailed address fields.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';

/**
 * Displays user's address information in a card layout.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing address information.
 * @return {!JSX.Element} Address card component.
 */
export default function AddressCard({data = {}}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Datos de domicilio</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-slate-600">País</label>
          <div className="mt-1 text-slate-900">{data.pais || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Estado/Provincia</label>
          <div className="mt-1 text-slate-900">{data.estado || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Ciudad</label>
          <div className="mt-1 text-slate-900">{data.ciudad || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Colonia</label>
          <div className="mt-1 text-slate-900">{data.colonia || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Código Postal</label>
          <div className="mt-1 text-slate-900">{data.codigoPostal || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Calle</label>
          <div className="mt-1 text-slate-900">{data.calle || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Exterior</label>
          <div className="mt-1 text-slate-900">{data.numExterior || <span className="text-slate-400">No disponible</span>}</div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Interior</label>
          <div className="mt-1 text-slate-900">{data.numInterior || <span className="text-slate-400">No disponible</span>}</div>
        </div>
      </div>
    </section>
  );
}
