import React from 'react';

export default function ProfileInfo({ data = {} }) {
  const nombreCompleto = `${data.nombres || ''} ${data.apellidoP || ''} ${data.apellidoM || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Información personal */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información personal</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Nombre(s)</label>
            <div className="mt-1 text-slate-900">{data.nombres || <span className="text-slate-400">No disponible</span>}</div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Apellidos</label>
            <div className="mt-1 text-slate-900">{`${data.apellidoP || ''} ${data.apellidoM || ''}`.trim() || <span className="text-slate-400">No disponible</span>}</div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Grado / Carrera</label>
            <div className="mt-1 text-slate-900">{data.licenciatura || <span className="text-slate-400">No disponible</span>}</div>
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información de contacto</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Correo electrónico</label>
            <div className="mt-1 text-slate-900">{data.email || <span className="text-slate-400">No disponible</span>}</div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Teléfono (profesional)</label>
            <div className="mt-1 text-slate-900">{data.telefonoWhatsApp || <span className="text-slate-400">No disponible</span>}</div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Teléfono (personal / WhatsApp)</label>
            <div className="mt-1 text-slate-900">{data.telefonoCasa || <span className="text-slate-400">No disponible</span>}</div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Redes sociales</label>
            <div className="mt-1 text-slate-900 space-y-1">
              {data.instagram ? (<div><a href={data.instagram} className="text-pink-600 underline" target="_blank" rel="noreferrer">Instagram</a></div>) : null}
              {data.linkedin ? (<div><a href={data.linkedin} className="text-sky-600 underline" target="_blank" rel="noreferrer">LinkedIn</a></div>) : null}
              {data.facebook ? (<div><a href={data.facebook} className="text-blue-600 underline" target="_blank" rel="noreferrer">Facebook</a></div>) : null}
              {data.paginaWeb ? (<div><a href={data.paginaWeb} className="text-slate-600 underline" target="_blank" rel="noreferrer">Sitio web</a></div>) : null}
              {!data.linkedin && !data.instagram && !data.facebook && !data.paginaWeb && (
                <div className="text-slate-400">No disponible</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
