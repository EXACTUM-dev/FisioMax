/**
 * @fileoverview Address card component for displaying user address information.
 * Shows country, state, city, and detailed address fields.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState } from 'react';

export default function AddressCard({ data = {}, canEdit = false, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    pais: data.pais || '',
    estado: data.estado || '',
    ciudad: data.ciudad || '',
    colonia: data.colonia || '',
    codigoPostal: data.codigoPostal || '',
    calle: data.calle || '',
    numExterior: data.numExterior || '',
    numInterior: data.numInterior || ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!onSave) return;
    await onSave({ ...form });
    setIsEditing(false);
  }
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Datos de domicilio</h3>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="text-slate-600 hover:text-slate-900"
            aria-label={isEditing ? 'Cancelar edición' : 'Editar domicilio'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
              <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-slate-600">País</label>
          {isEditing ? (
            <input name="pais" value={form.pais} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.pais || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Estado/Provincia</label>
          {isEditing ? (
            <input name="estado" value={form.estado} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.estado || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Ciudad</label>
          {isEditing ? (
            <input name="ciudad" value={form.ciudad} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.ciudad || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Colonia</label>
          {isEditing ? (
            <input name="colonia" value={form.colonia} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.colonia || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Código Postal</label>
          {isEditing ? (
            <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.codigoPostal || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Calle</label>
          {isEditing ? (
            <input name="calle" value={form.calle} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.calle || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Exterior</label>
          {isEditing ? (
            <input name="numExterior" value={form.numExterior} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.numExterior || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Interior</label>
          {isEditing ? (
            <input name="numInterior" value={form.numInterior} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
          ) : (
            <div className="mt-1 text-slate-900">{data.numInterior || <span className="text-slate-400">No disponible</span>}</div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 border rounded">Cancelar</button>
          <button onClick={handleSave} className="px-3 py-1 rounded text-white" style={{background:'#CAD00F'}}>Guardar</button>
        </div>
      )}
    </section>
  );
}

