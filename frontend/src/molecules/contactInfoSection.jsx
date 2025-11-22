/**
 * @fileoverview Contact information section with editable fields
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

export default function ContactInfoSection({
  data = {},
  formData = {},
  errors = {},
  isEditing = false,
  canEdit = false,
  isOwn = false,
  onToggleEdit,
  onChange,
  onSave,
  onCancel,
}) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Información de Contacto</h3>
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
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={onChange}
              error={errors.email}
              disabled={true}
              required
              maxLength={FIELD_MAX_LENGTHS.email}
            />
            <FormField
              label="Contacto profesional"
              name="telefonoProfesional"
              type="tel"
              value={formData.telefonoProfesional || ""}
              onChange={onChange}
              error={errors.telefonoProfesional}
              maxLength={FIELD_MAX_LENGTHS.telefonoProfesional}
            />
            <FormField
              label="Contacto personal (WhatsApp)"
              name="telefonoWhatsapp"
              type="tel"
              value={formData.telefonoWhatsapp || ""}
              onChange={onChange}
              error={errors.telefonoWhatsapp}
              required
              maxLength={FIELD_MAX_LENGTHS.telefonoWhatsapp}
            />
            <FormField
              label="Instagram"
              name="instagram"
              value={formData.instagram || ""}
              onChange={onChange}
              error={errors.instagram}
              maxLength={FIELD_MAX_LENGTHS.instagram}
            />
            <FormField
              label="LinkedIn"
              name="linkedin"
              value={formData.linkedin || ""}
              onChange={onChange}
              error={errors.linkedin}
              maxLength={FIELD_MAX_LENGTHS.linkedin}
            />
            <FormField
              label="Facebook"
              name="facebook"
              value={formData.facebook || ""}
              onChange={onChange}
              error={errors.facebook}
              maxLength={FIELD_MAX_LENGTHS.facebook}
            />
            <FormField
              label="Página Web"
              name="paginaWeb"
              value={formData.paginaWeb || ""}
              onChange={onChange}
              error={errors.paginaWeb}
              maxLength={FIELD_MAX_LENGTHS.paginaWeb}
            />
          </>
        ) : (
          <>
            <div>
              <label className="text-sm text-slate-600">
                Correo Electrónico
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div
                className="mt-1 text-slate-900"
                title={data.email || data.correo || ""}
              >
                {truncateText(data.email || data.correo, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Contacto profesional (Teléfono de oficina)
              </label>
              <div
                className="mt-1 text-slate-900"
                title={data.telefonoProfesional || ""}
              >
                {truncateText(data.telefonoProfesional, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Contacto personal (WhatsApp)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div
                className="mt-1 text-slate-900"
                title={data.telefonoWhatsapp || ""}
              >
                {truncateText(data.telefonoWhatsapp, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Instagram</label>
              <div className="mt-1 text-slate-900" title={data.instagram || ""}>
                {truncateText(data.instagram, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">LinkedIn</label>
              <div className="mt-1 text-slate-900" title={data.linkedin || ""}>
                {truncateText(data.linkedin, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Facebook</label>
              <div className="mt-1 text-slate-900" title={data.facebook || ""}>
                {truncateText(data.facebook, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Página Web</label>
              <div className="mt-1 text-slate-900" title={data.paginaWeb || ""}>
                {truncateText(data.paginaWeb, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={onSave}
            className="cursor-pointer"
          >
            Guardar
          </Button>
        </div>
      )}
    </section>
  );
}
