/**
 * @fileoverview Personal information section with editable fields
 * @version 0.2.0
 * @author EXACTUM-dev
 */

import React from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import FormField from "./form";
import { FIELD_MAX_LENGTHS } from "../utils/profileFormValidation";

/**
 * Truncates text to a maximum number of characters
 * @param {string} text - Text to truncate
 * @param {number} maxChars - Maximum number of characters
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateText(text = "", maxChars = 25) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

export default function PersonalInfoSection({
  data = {},
  formData = {},
  errors = {},
  isEditing = false,
  canEdit = false,
  onToggleEdit,
  onChange,
  onSave,
  onCancel,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Información Personal</h3>
        {canEdit && (
          <EditButton
            isEditing={isEditing}
            onClick={onToggleEdit}
            editLabel="Editar"
            cancelLabel="Cancelar"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEditing ? (
          <>
            <FormField
              label="Nombre(s)"
              name="nombres"
              value={formData.nombres || ""}
              onChange={onChange}
              error={errors.nombres}
              required
              maxLength={FIELD_MAX_LENGTHS.nombres}
            />
            <FormField
              label="Apellido Paterno"
              name="apellidoP"
              value={formData.apellidoP || ""}
              onChange={onChange}
              error={errors.apellidoP}
              required
              maxLength={FIELD_MAX_LENGTHS.apellidoP}
            />
            <FormField
              label="Apellido Materno"
              name="apellidoM"
              value={formData.apellidoM || ""}
              onChange={onChange}
              error={errors.apellidoM}
              maxLength={FIELD_MAX_LENGTHS.apellidoM}
            />
            <FormField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento || ""}
              onChange={onChange}
              error={errors.fechaNacimiento}
              required
            />
            <FormField
              label="Licenciatura"
              name="licenciatura"
              value={formData.licenciatura || ""}
              onChange={onChange}
              error={errors.licenciatura}
              maxLength={FIELD_MAX_LENGTHS.licenciatura}
            />
          </>
        ) : (
          <>
            <div>
              <label className="text-sm text-slate-600">
                Nombre(s)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900" title={data.nombres || ""}>
                {truncateText(data.nombres, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Apellido Paterno
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900" title={data.apellidoP || ""}>
                {truncateText(data.apellidoP, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Apellido Materno</label>
              <div className="mt-1 text-slate-900" title={data.apellidoM || ""}>
                {truncateText(data.apellidoM, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Fecha de Nacimiento
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900">
                {data.fechaNacimiento ? (
                  new Date(data.fechaNacimiento).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Licenciatura</label>
              <div
                className="mt-1 text-slate-900"
                title={data.licenciatura || ""}
              >
                {truncateText(data.licenciatura, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
          </>
        )}
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
