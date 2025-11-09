/**
 * @fileoverview Full Profile Form for Membership Application
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React from "react";
import FormField from "./form";
import Dropdown from "./dropdown";
import CareerDropdown from "./CareerDropdown";
import { getMaxBirthDate } from "../utils/profileFormValidation";

/**
 * Full profile form component for membership application
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onChange - Change handler for form fields
 * @param {Array} props.countries - List of country options
 * @param {Array} props.states - List of state options
 * @param {Array} props.cities - List of city options
 * @param {Function} props.onCountryChange - Handler for country selection change
 * @param {Function} props.onStateChange - Handler for state selection change
 * @returns {JSX.Element} FullProfileForm component
 */

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
          error={errors.nombres}
        />
        <FormField
          label="Apellido Paterno"
          name="apellidoP"
          required
          value={formData.apellidoP}
          onChange={onChange}
          placeholder="Ingresa tu apellido paterno"
          error={errors.apellidoP}
        />
        <FormField
          label="Apellido Materno"
          name="apellidoM"
          value={formData.apellidoM}
          onChange={onChange}
          placeholder="Ingresa tu apellido materno"
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
          label="Contacto profesional (Teléfono de oficina)"
          name="telefonoCasa"
          value={formData.telefonoCasa}
          onChange={onChange}
          placeholder="10-13 dígitos"
          error={errors.telefonoCasa}
        />
        <FormField
          label="Contacto personal (WhatsApp)"
          name="telefonoWhatsApp"
          required
          value={formData.telefonoWhatsApp}
          onChange={onChange}
          placeholder="10-13 dígitos"
          error={errors.telefonoWhatsApp}
        />
        <FormField
          label="Facebook"
          name="facebook"
          value={formData.facebook}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de Facebook"
          error={errors.facebook}
        />
        <FormField
          label="Instagram"
          name="instagram"
          value={formData.instagram}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de Instagram"
          error={errors.instagram}
        />
        <FormField
          label="LinkedIn"
          name="linkedin"
          value={formData.linkedin}
          onChange={onChange}
          placeholder="Ingresa tu cuenta de LinkedIn"
          error={errors.linkedin}
        />
        <FormField
          label="Página web"
          name="paginaWeb"
          value={formData.paginaWeb}
          onChange={onChange}
          placeholder="Ingresa tu página web"
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
          required
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
          error={errors.colonia}
        />
        <FormField
          label="Código Postal"
          name="codigoPostal"
          value={formData.codigoPostal}
          onChange={onChange}
          placeholder="5 dígitos"
          error={errors.codigoPostal}
        />
        <FormField
          label="Calle"
          name="calle"
          value={formData.calle}
          onChange={onChange}
          placeholder="Ingresa tu calle"
          error={errors.calle}
        />
        <FormField
          label="Número exterior"
          name="numExterior"
          value={formData.numExterior}
          onChange={onChange}
          placeholder="Número"
          error={errors.numExterior}
        />
        <FormField
          label="Número interior"
          name="numInterior"
          value={formData.numInterior}
          onChange={onChange}
          placeholder="Número (opcional)"
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
    </>
  );
}
