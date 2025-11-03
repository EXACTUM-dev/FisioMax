/**
 * @fileoverview Profile information card component.
 * Displays personal and contact information for users.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';

// Variables for country, state and city APIs
const COUNTRIES_API_BASE_URL = import.meta.env.VITE_COUNTRIES_API_BASE_URL;
const COUNTRIES_POSITIONS_ENDPOINT = import.meta.env.VITE_COUNTRIES_POSITIONS_ENDPOINT;
const COUNTRIES_STATES_ENDPOINT = import.meta.env.VITE_COUNTRIES_STATES_ENDPOINT;
const COUNTRIES_CITIES_ENDPOINT = import.meta.env.VITE_COUNTRIES_CITIES_ENDPOINT;

// Predefined career options for licenciatura field
const CAREER_OPTIONS = [
  "Fisioterapia",
  "Terapia Física",
  "Rehabilitación",
  "Kinesiología",
  "Terapia Ocupacional",
  "Medicina",
  "Enfermería",
  "Psicología",
  "Educación Física",
  "Ciencias del Deporte",
  "Quiropráctica",
  "Osteopatía",
  "Nutrición",
  "Gerontología"
];

/**
 * Select field component for dropdowns.
 */
const SelectField = ({ label, name, value, onChange, options, required, error }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 w-full border rounded px-2 py-1 bg-white text-slate-900"
    >
      <option value="">Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

/**
 * Combobox field component for dropdown with custom input option.
 */
const ComboboxField = ({ label, name, value, onChange, options, required, error, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue
      }
    };
    onChange(syntheticEvent);
  };

  const handleOptionSelect = (option) => {
    setInputValue(option);
    setIsOpen(false);
    
    const syntheticEvent = {
      target: {
        name: name,
        value: option
      }
    };
    onChange(syntheticEvent);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className="mt-1 w-full border rounded px-2 py-1 bg-white text-slate-900"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No se encontraron opciones
            </div>
          )}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

/**
 * Displays user's personal and contact information.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data object.
 * @return {!JSX.Element} Profile information component.
 */

export default function ProfileInfo({ data = {}, canEdit = false, onSave }) {
  const nombreCompleto = `${data.nombres || ''} ${data.apellidoP || ''} ${data.apellidoM || ''}`.trim();

  // Separate editing states for each section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Separate forms for each section
  const [personalForm, setPersonalForm] = useState({
    nombres: data.nombres || '',
    apellidoP: data.apellidoP || '',
    apellidoM: data.apellidoM || '',
    fechaNacimiento: data.fechaNacimiento || '',
    licenciatura: data.licenciatura || ''
  });

  const [contactForm, setContactForm] = useState({
    email: data.email || '',
    telefono: data.telefono || '',
    instagram: data.instagram || '',
    linkedin: data.linkedin || '',
    facebook: data.facebook || '',
    paginaWeb: data.paginaWeb || ''
  });

  // Reset forms when data changes
  useEffect(() => {
    setPersonalForm({
      nombres: data.nombres || '',
      apellidoP: data.apellidoP || '',
      apellidoM: data.apellidoM || '',
      fechaNacimiento: data.fechaNacimiento || '',
      licenciatura: data.licenciatura || ''
    });
    setContactForm({
      email: data.email || '',
      telefono: data.telefono || '',
      instagram: data.instagram || '',
      linkedin: data.linkedin || '',
      facebook: data.facebook || '',
      paginaWeb: data.paginaWeb || ''
    });
  }, [data]);

  function handlePersonalChange(e) {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleContactChange(e) {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSavePersonal() {
    if (!onSave) return;
    await onSave({
      nombres: personalForm.nombres,
      apellidoP: personalForm.apellidoP,
      apellidoM: personalForm.apellidoM,
      fechaNacimiento: personalForm.fechaNacimiento,
      licenciatura: personalForm.licenciatura
    });
    setIsEditingPersonal(false);
  }

  async function handleSaveContact() {
    if (!onSave) return;
    await onSave({
      correo: contactForm.email,
      telefono: contactForm.telefono,
      instagram: contactForm.instagram,
      linkedin: contactForm.linkedin,
      facebook: contactForm.facebook,
      paginaWeb: contactForm.paginaWeb
    });
    setIsEditingContact(false);
  }

  return (
    <div className="space-y-6">
      {/* Personal information section */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información personal</h3>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditingPersonal((v) => !v)}
              className="text-slate-600 hover:text-slate-900"
              aria-label={isEditingPersonal ? 'Cancelar edición' : 'Editar información personal'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
                <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Nombre(s)</label>
            {isEditingPersonal ? (
              <input name="nombres" value={personalForm.nombres} onChange={handlePersonalChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.nombres || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Apellidos</label>
            {isEditingPersonal ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input name="apellidoP" value={personalForm.apellidoP} onChange={handlePersonalChange} placeholder="Apellido paterno" className="border rounded px-2 py-1" />
                <input name="apellidoM" value={personalForm.apellidoM} onChange={handlePersonalChange} placeholder="Apellido materno" className="border rounded px-2 py-1" />
              </div>
            ) : (
              <div className="mt-1 text-slate-900">{`${data.apellidoP || ''} ${data.apellidoM || ''}`.trim() || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Fecha de nacimiento</label>
            {isEditingPersonal ? (
              <input type="date" name="fechaNacimiento" value={personalForm.fechaNacimiento} onChange={handlePersonalChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.fechaNacimiento || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            {isEditingPersonal ? (
              <ComboboxField
                label="Grado / Carrera"
                name="licenciatura"
                value={personalForm.licenciatura}
                onChange={handlePersonalChange}
                options={CAREER_OPTIONS}
                placeholder="Selecciona o escribe tu licenciatura"
              />
            ) : (
              <>
                <label className="text-sm text-slate-600">Grado / Carrera</label>
                <div className="mt-1 text-slate-900">{data.licenciatura || <span className="text-slate-400">No disponible</span>}</div>
              </>
            )}
          </div>
        </div>

        {isEditingPersonal && (
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => {
                setIsEditingPersonal(false);
                // Restore original values
                setPersonalForm({
                  nombres: data.nombres || '',
                  apellidoP: data.apellidoP || '',
                  apellidoM: data.apellidoM || '',
                  fechaNacimiento: data.fechaNacimiento || '',
                  licenciatura: data.licenciatura || ''
                });
              }} 
              className="px-3 py-1 border rounded"
            >
              Cancelar
            </button>
            <button onClick={handleSavePersonal} className="px-3 py-1 rounded text-white" style={{background:'#CAD00F'}}>Guardar</button>
          </div>
        )}
      </section>

      {/* Contact information section */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información de contacto</h3>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditingContact((v) => !v)}
              className="text-slate-600 hover:text-slate-900"
              aria-label={isEditingContact ? 'Cancelar edición' : 'Editar información de contacto'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
                <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-slate-600">Correo electrónico</label>
            {isEditingContact ? (
              <input name="email" value={contactForm.email} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.email || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Teléfono</label>
            {isEditingContact ? (
              <input name="telefono" value={contactForm.telefono} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">{data.telefono || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Instagram</label>
            {isEditingContact ? (
              <input name="instagram" value={contactForm.instagram} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.instagram ? (
                  <a href={data.instagram} className="text-pink-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.instagram}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">LinkedIn</label>
            {isEditingContact ? (
              <input name="linkedin" value={contactForm.linkedin} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.linkedin ? (
                  <a href={data.linkedin} className="text-sky-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.linkedin}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Facebook</label>
            {isEditingContact ? (
              <input name="facebook" value={contactForm.facebook} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.facebook ? (
                  <a href={data.facebook} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.facebook}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Página Web</label>
            {isEditingContact ? (
              <input name="paginaWeb" value={contactForm.paginaWeb} onChange={handleContactChange} className="mt-1 w-full border rounded px-2 py-1" />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.paginaWeb ? (
                  <a href={data.paginaWeb} className="text-slate-600 hover:underline" target="_blank" rel="noreferrer">
                    {data.paginaWeb}
                  </a>
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditingContact && (
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => {
                setIsEditingContact(false);
                // Restore original values
                setContactForm({
                  email: data.email || '',
                  telefono: data.telefono || '',
                  instagram: data.instagram || '',
                  linkedin: data.linkedin || '',
                  facebook: data.facebook || '',
                  paginaWeb: data.paginaWeb || ''
                });
              }} 
              className="px-3 py-1 border rounded"
            >
              Cancelar
            </button>
            <button onClick={handleSaveContact} className="px-3 py-1 rounded text-white" style={{background:'#CAD00F'}}>Guardar</button>
          </div>
        )}
      </section>
    </div>
  );
}
