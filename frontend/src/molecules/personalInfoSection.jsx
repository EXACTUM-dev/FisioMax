/**
 * @fileoverview Personal Information Section Component
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import CareerDropdown from "./CareerDropdown";
import {
  formatDateForDisplay,
  getMaxBirthDate,
} from "../utils/profileFormValidation";

/**
 * Personal information section with edit functionality
 * @param {Object} props
 * @param {Object} props.data - Current personal information data
 * @param {Object} props.formData - Form state for editing
 * @returns {JSX.Element} PersonalInfoSection component
 */

export default function PersonalInfoSection({
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
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Información personal</h3>
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
            Nombre(s)
            <span className="text-red-500 ml-1">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                name="nombres"
                value={formData.nombres}
                onChange={onChange}
                required
                maxLength={50}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
              {errors.nombres && (
                <p className="mt-1 text-sm text-red-500">{errors.nombres}</p>
              )}
            </>
          ) : (
            <div className="mt-1 text-slate-900">
              {data.nombres || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">
            Apellidos
            <span className="text-red-500 ml-1">*</span>
          </label>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <input
                  name="apellidoP"
                  value={formData.apellidoP}
                  onChange={onChange}
                  placeholder="Paterno"
                  required
                  maxLength={50}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
                />
                {errors.apellidoP && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.apellidoP}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="apellidoM"
                  value={formData.apellidoM}
                  onChange={onChange}
                  placeholder="Materno"
                  maxLength={50}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
                />
                {errors.apellidoM && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.apellidoM}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1 text-slate-900">
              {`${data.apellidoP || ""} ${data.apellidoM || ""}`.trim() || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">
            Fecha de nacimiento
            <span className="text-red-500 ml-1">*</span>
          </label>
          {isEditing ? (
            <>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={onChange}
                max={getMaxBirthDate()}
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
              {errors.fechaNacimiento && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fechaNacimiento}
                </p>
              )}
            </>
          ) : (
            <div className="mt-1 text-slate-900">
              {data.fechaNacimiento ? (
                formatDateForDisplay(data.fechaNacimiento)
              ) : (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {/* ✅ USAR COMPONENTE COMPARTIDO */}
        <div>
          <CareerDropdown
            name="licenciatura"
            value={isEditing ? formData.licenciatura : data.licenciatura}
            onChange={onChange}
            error={errors.licenciatura}
            disabled={!isEditing}
          />
        </div>
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
