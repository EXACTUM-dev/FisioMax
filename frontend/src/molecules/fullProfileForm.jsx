/**
 * @fileoverview Full Profile Form for Membership Application
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import FormField from "./form";
import Dropdown from "./dropdown";
import CareerDropdown from "./careerDropdown";
import {
  getMaxBirthDate,
  FIELD_MAX_LENGTHS,
} from "../utils/profileFormValidation";
import { AiOutlineInfoCircle } from "react-icons/ai";

export default function FullProfileForm({
  formData,
  errors,
  onChange,
  countries,
  states,
  cities,
  onCountryChange,
  onStateChange,
}) {
  const [showInfoFormation, setShowInfoFormation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const wrapper = document.getElementById("membership-select-wrapper");
      if (!wrapper) return;
      const manual = wrapper.querySelector(".manual-req");
      const candidates = wrapper.querySelectorAll("span, small, i, label");
      candidates.forEach((node) => {
        if (node === manual) return;
        if (node.textContent && node.textContent.trim() === "*") {
          node.style.display = "none";
        }
      });
    }, 60); // small delay so Dropdown internal markup exists
    return () => clearTimeout(timer);
  }, []);

  const membershipOptions = [
    { value: "Estudiante", label: "Estudiante" },
    { value: "Licenciado en Formación", label: "Licenciado en Formación" },
    { value: "Licenciado Especializado", label: "Licenciado Especializado" },
    { value: "Fisioterapeuta Extranjero", label: "Fisioterapeuta Extranjero" },
    { value: "Personal de la Salud", label: "Personal de la Salud" },
  ];
  return (
    <>
      {/* Personal Information Section */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi perfil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nombre(s)"
          name="nombres"
          required
          value={formData.nombres}
          onChange={onChange}
          placeholder="Ingresa tu(s) nombre(s)"
          maxLength={FIELD_MAX_LENGTHS.nombres}
          error={errors.nombres}
        />
        <FormField
          label="Apellido Paterno"
          name="apellidoP"
          required
          value={formData.apellidoP}
          onChange={onChange}
          placeholder="Ingresa tu apellido paterno"
          maxLength={FIELD_MAX_LENGTHS.apellidoP}
          error={errors.apellidoP}
        />
        <FormField
          label="Apellido Materno"
          name="apellidoM"
          value={formData.apellidoM}
          onChange={onChange}
          placeholder="Ingresa tu apellido materno"
          maxLength={FIELD_MAX_LENGTHS.apellidoM}
          error={errors.apellidoM}
        />
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={onChange}
          placeholder="Ingresa tu email"
          maxLength={FIELD_MAX_LENGTHS.email}
          error={errors.email}
        />
        <FormField
          label="Fecha de nacimiento"
          name="fechaNacimiento"
          type="date"
          required
          value={formData.fechaNacimiento}
          onChange={onChange}
          max={getMaxBirthDate()}
          error={errors.fechaNacimiento}
        />
        <FormField
          label="Contacto profesional"
          name="telefonoProfesional"
          value={formData.telefonoProfesional}
          onChange={onChange}
          placeholder="10-13 dígitos"
          maxLength={FIELD_MAX_LENGTHS.telefonoProfesional}
          error={errors.telefonoProfesional}
        />
        <FormField
          label="Contacto personal (WhatsApp)"
          name="telefonoWhatsapp"
          required
          value={formData.telefonoWhatsapp}
          onChange={onChange}
          placeholder="10-13 dígitos"
          maxLength={FIELD_MAX_LENGTHS.telefonoWhatsapp}
          error={errors.telefonoWhatsapp}
        />
        <FormField
          label="Facebook"
          name="facebook"
          value={formData.facebook}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de Facebook"
          maxLength={FIELD_MAX_LENGTHS.facebook}
          error={errors.facebook}
        />
        <FormField
          label="Instagram"
          name="instagram"
          value={formData.instagram}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de Instagram"
          maxLength={FIELD_MAX_LENGTHS.instagram}
          error={errors.instagram}
        />
        <FormField
          label="LinkedIn"
          name="linkedin"
          value={formData.linkedin}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de LinkedIn"
          maxLength={FIELD_MAX_LENGTHS.linkedin}
          error={errors.linkedin}
        />
        <FormField
          label="Página web"
          name="paginaWeb"
          value={formData.paginaWeb}
          onChange={onChange}
          placeholder="Ingresa tu página web"
          maxLength={FIELD_MAX_LENGTHS.paginaWeb}
          error={errors.paginaWeb}
        />
      </div>

      {/* Address Section */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-5">
        Ubicación de práctica profesional
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Dropdown
          label="País"
          name="pais"
          required
          value={formData.pais}
          onChange={(e) => onCountryChange(e.target.value)}
          options={countries}
          error={errors.pais}
          placeholder="Selecciona un país"
        />
        <Dropdown
          label="Estado / Provincia"
          name="estado"
          required
          value={formData.estado}
          onChange={(e) => onStateChange(e.target.value)}
          options={states}
          error={errors.estado}
          placeholder="Selecciona un estado"
        />
        <Dropdown
          label="Ciudad"
          name="ciudad"
          value={formData.ciudad}
          onChange={onChange}
          options={cities}
          error={errors.ciudad}
          placeholder="Selecciona una ciudad"
        />
        <FormField
          label="Colonia"
          name="colonia"
          value={formData.colonia}
          onChange={onChange}
          placeholder="Ingresa tu colonia"
          maxLength={FIELD_MAX_LENGTHS.colonia}
          error={errors.colonia}
        />
        <FormField
          label="Código Postal"
          name="codigoPostal"
          value={formData.codigoPostal}
          onChange={onChange}
          placeholder="5 dígitos"
          maxLength={FIELD_MAX_LENGTHS.codigoPostal}
          error={errors.codigoPostal}
        />
        <FormField
          label="Calle"
          name="calle"
          value={formData.calle}
          onChange={onChange}
          placeholder="Ingresa tu calle"
          maxLength={FIELD_MAX_LENGTHS.calle}
          error={errors.calle}
        />
        <FormField
          label="Número exterior"
          name="numExterior"
          value={formData.numExterior}
          onChange={onChange}
          placeholder="Número"
          maxLength={FIELD_MAX_LENGTHS.numExterior}
          error={errors.numExterior}
        />
        <FormField
          label="Número interior"
          name="numInterior"
          value={formData.numInterior}
          onChange={onChange}
          placeholder="Número (opcional)"
          maxLength={FIELD_MAX_LENGTHS.numInterior}
          error={errors.numInterior}
        />
      </div>

      <div className="mt-4">
        <CareerDropdown
          name="licenciatura"
          value={formData.licenciatura}
          onChange={onChange}
          error={errors.licenciatura}
        />
      </div>
      <div className="pt-10 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="membership-select-wrapper" className="relative">
          <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            Tipo de membresía
            {/* info button (opens overview#pricing in same tab) */}
            <button
              type="button"
              title="Ver planes y precios"
              onClick={() => {
                window.open("/overview#pricing", "_blank");
              }}
              className="text-[#CAD00F] hover:text-[#b8bd0d] focus:outline-none cursor-pointer"
              aria-label="Ver planes y precios"
            >
              <AiOutlineInfoCircle size={18} />
            </button>
            {/* keep a single visible asterisk inline */}
            <span className="manual-req text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          </label>

          {/* invisible native input to guarantee browser `required` constraint
              (no name so it won't be included in form submission) */}
          <input
            aria-hidden="true"
            tabIndex={-1}
            required
            readOnly
            value={formData.membershipType || ""}
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
          />

          <Dropdown
            label={null}
            name="membershipType"
            required
            value={formData.membershipType}
            onChange={onChange}
            options={membershipOptions}
            error={errors.membershipType}
            placeholder="Selecciona el tipo de membresía"
          />
        </div>
        <div className="relative">
          <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            Horas de formación
            <button
              type="button"
              className="ml-2 text-[#CAD00F] hover:text-[#b8bd0d] focus:outline-none cursor-pointer self-start -mt-1"
              onClick={() => setShowInfoFormation((v) => !v)}
              aria-label="Información sobre horas de formación"
            >
              <AiOutlineInfoCircle size={20} />
            </button>
            {/* Require hours only for the "Licenciado Especializado" membership */}
            {formData.membershipType === "Licenciado Especializado" && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="number"
            name="membershipHoursFormation"
            value={formData.membershipHoursFormation}
            onChange={(e) => {
              // enforce max 4 characters (digits). keep numeric input but prevent longer values.
              if (String(e.target.value).length > 4) {
                e.target.value = String(e.target.value).slice(0, 4);
              }
              onChange(e);
            }}
            className="w-full border border-gray-300 bg-white rounded-md px-3 py-2  -mt-1 focus:outline-none focus:ring-2 focus:ring-[#CAD00F] transition"
            min="0"
            max="9999"
            placeholder="Ejemplo: 120"
            required={formData.membershipType === "Licenciado Especializado"}
          />
          {showInfoFormation && (
            <div className="absolute z-10 left-0 mt-2 w-72 bg-white border border-[#CAD00F] rounded shadow-lg p-4 text-sm text-gray-700">
              Justifica tus horas de formación en piso pélvico con certificados.
              Para licenciados especializados, es necesario mínimo tener 120
              horas.
            </div>
          )}
          {formData.membershipType === "Licenciado Especializado" &&
            Number(formData.membershipHoursFormation) < 120 && (
              <p className="text-xs text-red-500 mt-2">
                Para licenciados especializados, debes tener al menos 120 horas
                de formación.
              </p>
            )}
        </div>
      </div>
    </>
  );
}
