/**
 * @fileoverview Contact Information Section Component
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";

export default function ContactInfoSection({
  data,
  formData,
  errors,
  isEditing,
  canEdit,
  onToggleEdit,
  onChange,
  onSave,
  onCancel,
}) {
  const socialFields = ["instagram", "linkedin", "facebook", "paginaWeb"];

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Información de contacto</h3>
        {canEdit && (
          <EditButton
            isEditing={isEditing}
            onClick={onToggleEdit}
            editLabel="Editar"
            cancelLabel="Cancelar"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-slate-600">
            Correo electrónico
            <span className="text-red-500 ml-1">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                required
                maxLength={100}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </>
          ) : (
            <div className="mt-1 text-slate-900">
              {data.email || data.correo || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Teléfono</label>
          {isEditing ? (
            <>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={onChange}
                maxLength={13}
                placeholder="10-13 dígitos"
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
              )}
            </>
          ) : (
            <div className="mt-1 text-slate-900">
              {data.telefono || data.telefonoCasa || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {socialFields.map((field) => (
          <div key={field}>
            <label className="text-sm text-slate-600">
              {field === "paginaWeb"
                ? "Página Web"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {isEditing ? (
              <>
                <input
                  name={field}
                  value={formData[field]}
                  onChange={onChange}
                  maxLength={
                    field === "paginaWeb"
                      ? 200
                      : field === "instagram"
                      ? 50
                      : 100
                  }
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
                )}
              </>
            ) : (
              <div className="mt-1 text-slate-900">
                {data[field] ? (
                  <a
                    href={data[field]}
                    className={`${
                      field === "instagram"
                        ? "text-pink-600"
                        : field === "linkedin"
                        ? "text-sky-600"
                        : field === "facebook"
                        ? "text-blue-600"
                        : "text-slate-600"
                    } hover:underline`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data[field]}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="brand" size="sm" onClick={onSave}>
            Guardar
          </Button>
        </div>
      )}
    </section>
  );
}
