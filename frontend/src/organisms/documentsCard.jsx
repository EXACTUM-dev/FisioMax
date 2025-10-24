import React from 'react';

export default function DocumentsCard({ data = {} }) {
  const hasFile = (v) => !!v;

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Documentación</h3>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-600">Título / Kardex</span>
          <span className="font-medium">{hasFile(data.titulo) ? 'Cargado' : 'No cargado'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Cédula profesional</span>
          <span className="font-medium">{hasFile(data.cedula) ? 'Cargado' : 'No cargado'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Constancias</span>
          <span className="font-medium">{hasFile(data.constancias) ? 'Cargado' : 'No cargado'}</span>
        </div>
      </div>
    </section>
  );
}
