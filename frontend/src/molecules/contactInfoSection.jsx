/**
 * @fileoverview Contact Information Section Component
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import FormField from "./form";
import { FIELD_MAX_LENGTHS } from "../utils/profileFormValidation";

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
  const socialFields = [
    { key: "instagram", label: "Instagram" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "facebook", label: "Facebook" },
    { key: "paginaWeb", label: "Página Web" },
  ];

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
        {/* Correo electrónico */}
        <div>
          {!isEditing && (
            <label className="text-sm text-slate-600 mb-1 block">
              Correo electrónico
              <span className="text-red-500 ml-1">*</span>
            </label>
          )}
          {isEditing ? (
            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="correo@ejemplo.com"
              maxLength={FIELD_MAX_LENGTHS.email}
              required
              error={errors.email}
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.email || data.correo || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {/* Teléfono */}
        <div>
          {!isEditing && (
            <label className="text-sm text-slate-600 mb-1 block">
              Teléfono
            </label>
          )}
          {isEditing ? (
            <FormField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={onChange}
              placeholder="10-13 dígitos"
              maxLength={FIELD_MAX_LENGTHS.telefono}
              error={errors.telefono}
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.telefono || data.telefonoCasa || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {/* Redes sociales - SIN ENLACES NI COLORES */}
        {socialFields.map(({ key, label }) => (
          <div key={key}>
            {!isEditing && (
              <label className="text-sm text-slate-600 mb-1 block">
                {label}
              </label>
            )}
            {isEditing ? (
              <FormField
                label={label}
                name={key}
                value={formData[key]}
                onChange={onChange}
                placeholder={`Tu ${label.toLowerCase()}`}
                maxLength={FIELD_MAX_LENGTHS[key]}
                error={errors[key]}
              />
            ) : (
              <div className="mt-1 text-slate-900">
                {data[key] || (
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
