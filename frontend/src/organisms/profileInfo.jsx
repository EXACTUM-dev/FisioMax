import React, { useState } from 'react';

export default function ProfileInfo({ data = {}, canEdit = false, onSave }) {
  const nombreCompleto = `${data.nombres || ''} ${data.apellidoP || ''} ${data.apellidoM || ''}`.trim();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombres: data.nombres || '',
    apellidoP: data.apellidoP || '',
    apellidoM: data.apellidoM || '',
    email: data.email || '',
    telefono: data.telefono || '',
    fechaNacimiento: data.fechaNacimiento || '',
    licenciatura: data.licenciatura || '',
    instagram: data.instagram || '',
    linkedin: data.linkedin || '',
    facebook: data.facebook || '',
    paginaWeb: data.paginaWeb || ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!onSave) return;
    await onSave({
      nombres: form.nombres,
      apellidoP: form.apellidoP,
      apellidoM: form.apellidoM,
      correo: form.email,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      licenciatura: form.licenciatura,
      instagram: form.instagram,
      linkedin: form.linkedin,
      facebook: form.facebook,
      paginaWeb: form.paginaWeb
    });
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Información personal */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información personal</h3>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className="text-slate-600 hover:text-slate-900"
              aria-label={isEditing ? 'Cancelar edición' : 'Editar información'}
            >
              {/* simple lápiz */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
                <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Nombre(s)</label>
            {isEditing ? (
              <input name="nombres" value={form.nombres} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.nombres || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Apellidos</label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input name="apellidoP" value={form.apellidoP} onChange={handleChange} placeholder="Apellido paterno" className="border rounded px-2 py-1" />
                <input name="apellidoM" value={form.apellidoM} onChange={handleChange} placeholder="Apellido materno" className="border rounded px-2 py-1" />
              </div>
            ) : (
              <div className="mt-1 text-slate-900">{`${data.apellidoP || ''} ${data.apellidoM || ''}`.trim() || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Fecha de nacimiento</label>
            {isEditing ? (
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.fechaNacimiento || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Grado / Carrera</label>
            {isEditing ? (
              <input name="licenciatura" value={form.licenciatura} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.licenciatura || <span className="text-slate-400">No disponible</span>}</div>
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

      {/* Información de contacto */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información de contacto</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Correo electrónico</label>
            {isEditing ? (
              <input name="email" value={form.email} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.email || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Teléfono</label>
            {isEditing ? (
              <input name="telefono" value={form.telefono} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.telefono || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Instagram</label>
            {isEditing ? (
              <input name="instagram" value={form.instagram} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.instagram ? (
                  <a href={data.instagram} className="text-pink-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.instagram}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">LinkedIn</label>
            {isEditing ? (
              <input name="linkedin" value={form.linkedin} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.linkedin ? (
                  <a href={data.linkedin} className="text-sky-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.linkedin}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Facebook</label>
            {isEditing ? (
              <input name="facebook" value={form.facebook} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.facebook ? (
                  <a href={data.facebook} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.facebook}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Página Web</label>
            {isEditing ? (
              <input name="paginaWeb" value={form.paginaWeb} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.paginaWeb ? (
                  <a href={data.paginaWeb} className="text-slate-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.paginaWeb}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
