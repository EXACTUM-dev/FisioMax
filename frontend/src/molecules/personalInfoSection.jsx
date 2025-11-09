/**
 * @fileoverview Personal Information Section Component
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import CareerDropdown from "./CareerDropdown";
import FormField from "./form";
import {
  formatDateForDisplay,
  getMaxBirthDate,
  FIELD_MAX_LENGTHS,
} from "../utils/profileFormValidation";

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
        {/* Nombre(s) */}
        <div>
          {!isEditing && (
            <label className="text-sm text-slate-600 mb-1 block">
              Nombre(s)
              <span className="text-red-500 ml-1">*</span>
            </label>
          )}
          {isEditing ? (
            <FormField
              label="Nombre(s)"
              name="nombres"
              value={formData.nombres}
              onChange={onChange}
              placeholder="Ingresa tu(s) nombre(s)"
              maxLength={FIELD_MAX_LENGTHS.nombres}
              required
              error={errors.nombres}
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.nombres || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {/* Apellido Paterno */}
        <div>
          {!isEditing && (
            <label className="text-sm text-slate-600 mb-1 block">
              Apellidos
              <span className="text-red-500 ml-1">*</span>
            </label>
          )}
          {isEditing ? (
            <FormField
              label="Apellido Paterno"
              name="apellidoP"
              value={formData.apellidoP}
              onChange={onChange}
              placeholder="Apellido Paterno"
              maxLength={FIELD_MAX_LENGTHS.apellidoP}
              required
              error={errors.apellidoP}
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {`${data.apellidoP || ""} ${data.apellidoM || ""}`.trim() || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        {/* Apellido Materno - Solo visible en modo edición */}
        {isEditing && (
          <div>
            <FormField
              label="Apellido Materno"
              name="apellidoM"
              value={formData.apellidoM}
              onChange={onChange}
              placeholder="Apellido Materno"
              maxLength={FIELD_MAX_LENGTHS.apellidoM}
              error={errors.apellidoM}
            />
          </div>
        )}

        {/* Fecha de nacimiento */}
        <div>
          {!isEditing && (
            <label className="text-sm text-slate-600 mb-1 block">
              Fecha de nacimiento
              <span className="text-red-500 ml-1">*</span>
            </label>
          )}
          {isEditing ? (
            <div className="flex flex-col items-start w-full">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Fecha de nacimiento
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={onChange}
                max={getMaxBirthDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#CAD00F] text-gray-900"
              />
              {errors.fechaNacimiento && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fechaNacimiento}
                </p>
              )}
            </div>
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

        {/* Licenciatura */}
        <div className={isEditing ? "sm:col-span-2" : ""}>
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
