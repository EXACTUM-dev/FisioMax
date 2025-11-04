/**
 * @fileoverview History card component for displaying user history/stats.
 * Shows completed courses, diplomas, and service hours.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import editIcon from "../assets/icons/square-pen.png";
import SuccessErrorModal from './successErrorModal';

export default function HistoryCard({ data = {}, canEdit = false, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
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
    try {
      await onSave({
        cursosCompletados: form.cursosCompletados || null,
        diplomados: form.diplomados || null,
        horasServicio: form.horasServicio || null
      });
      setIsEditing(false);
      
      // Show success modal
      setModalType('success');
      setModalMessage('El historial se ha actualizado exitosamente.');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving history:', error);
      // Show error modal
      setModalType('error');
      setModalMessage(error.message || 'Error al guardar el historial. Por favor, intente nuevamente.');
      setShowModal(true);
    }
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold mb-3">Historial</h3>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50"
            aria-label={isEditing ? 'Cancelar edición' : 'Editar historial'}
          >
            <img
              src={editIcon}
              alt="Editar"
              className="w-5 h-5 object-contain opacity-80"
            />
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

      {/* Success/Error Modal */}
      <SuccessErrorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalMessage}
        title={
          modalType === "success"
            ? "¡Operación exitosa!"
            : "Error en la operación"
        }
      />
    </section>
  );
}

