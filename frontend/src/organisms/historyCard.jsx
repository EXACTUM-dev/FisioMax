/**
 * @fileoverview History card component for displaying user history/stats.
 * Shows completed courses, diplomas, and service hours.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';

export default function HistoryCard({ data = {}, canEdit = false, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    cursosCompletados: data.cursosCompletados || '',
    diplomados: data.diplomados || '',
    horasServicio: data.horasServicio || ''
  });

  // Reset form when data changes
  useEffect(() => {
    setForm({
      cursosCompletados: data.cursosCompletados || '',
      diplomados: data.diplomados || '',
      horasServicio: data.horasServicio || ''
    });
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;
    // Only allow numbers
    const numericValue = value === '' ? '' : value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, [name]: numericValue }));
  }

  async function handleSave() {
    if (!onSave) return;
    await onSave({
      cursosCompletados: form.cursosCompletados || null,
      diplomados: form.diplomados || null,
      horasServicio: form.horasServicio || null
    });
    setIsEditing(false);
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold mb-3">Historial</h3>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="text-slate-600 hover:text-slate-900"
            aria-label={isEditing ? 'Cancelar edición' : 'Editar historial'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
              <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Cursos Completados</div>
          {isEditing ? (
            <input
              type="text"
              name="cursosCompletados"
              value={form.cursosCompletados}
              onChange={handleChange}
              className="mt-2 w-full border rounded px-2 py-1 text-center"
              placeholder="0"
            />
          ) : (
            <div className="font-medium mt-2">{data.cursosCompletados || '—'}</div>
          )}
        </div>
        <div>
          <div className="text-xs text-slate-500">Diplomados</div>
          {isEditing ? (
            <input
              type="text"
              name="diplomados"
              value={form.diplomados}
              onChange={handleChange}
              className="mt-2 w-full border rounded px-2 py-1 text-center"
              placeholder="0"
            />
          ) : (
            <div className="font-medium mt-2">{data.diplomados || '—'}</div>
          )}
        </div>
        <div>
          <div className="text-xs text-slate-500">Horas de servicio</div>
          {isEditing ? (
            <input
              type="text"
              name="horasServicio"
              value={form.horasServicio}
              onChange={handleChange}
              className="mt-2 w-full border rounded px-2 py-1 text-center"
              placeholder="0"
            />
          ) : (
            <div className="font-medium mt-2">{data.horasServicio || '—'}</div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
              // Restore original values
              setForm({
                cursosCompletados: data.cursosCompletados || '',
                diplomados: data.diplomados || '',
                horasServicio: data.horasServicio || ''
              });
            }}
            className="px-3 py-1 border rounded"
          >
            Cancelar
          </button>
          <button onClick={handleSave} className="px-3 py-1 rounded text-white" style={{background:'#CAD00F'}}>
            Guardar
          </button>
        </div>
      )}
    </section>
  );
}

