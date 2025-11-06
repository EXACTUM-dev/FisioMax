/**
 * @fileoverview Profile information card component.
 * Displays personal and contact information for users.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import SuccessErrorModal from './successErrorModal';
import Modal from '../molecules/modal';
import Dropdown from '../molecules/dropdown';
import EditButton from '../atoms/editButton';
import Button from "../atoms/button";

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
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent bg-white text-slate-900"
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
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * Format date from ISO string to dd/mm/aaaa
   * @param {string} dateString - ISO date string or date string
   * @returns {string} Formatted date as dd/mm/aaaa
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString; // Return original if error
    }
  };

  /**
   * Convert date to YYYY-MM-DD format for input type="date"
   * @param {string} dateString - Date string in any format
   * @returns {string} Date in YYYY-MM-DD format
   */
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  /**
   * Calculate maximum date (15 years ago from today)
   * @returns {string} Date in YYYY-MM-DD format
   */
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  // Separate forms for each section
  const [personalForm, setPersonalForm] = useState({
    nombres: data.nombres || '',
    apellidoP: data.apellidoP || '',
    apellidoM: data.apellidoM || '',
    fechaNacimiento: formatDateForInput(data.fechaNacimiento) || '',
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
      fechaNacimiento: formatDateForInput(data.fechaNacimiento) || '',
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

  /**
   * Validates required fields for personal information
   * @returns {boolean} True if valid, false otherwise
   */
  const validatePersonalInfo = () => {
    const missingFields = [];
    
    if (!personalForm.nombres || personalForm.nombres.trim() === '') {
      missingFields.push('Nombre(s)');
    }
    if (!personalForm.apellidoP || personalForm.apellidoP.trim() === '') {
      missingFields.push('Apellido Paterno');
    }
    if (!personalForm.fechaNacimiento || personalForm.fechaNacimiento.trim() === '') {
      missingFields.push('Fecha de nacimiento');
    }
    
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }
    
    return true;
  };

  async function handleSavePersonal() {
    if (!onSave) return;
    
    // Validate required fields
    if (!validatePersonalInfo()) {
      return;
    }
    
    // Validate date if provided
    if (personalForm.fechaNacimiento) {
      const birthDate = new Date(personalForm.fechaNacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      // Calculate actual age considering month and day
      const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      
      if (actualAge < 15) {
        setModalType('error');
        setModalMessage('La fecha de nacimiento debe corresponder a una persona mayor de 15 años.');
        setShowModal(true);
        return;
      }
      
      // Check if date is in the future
      if (birthDate > today) {
        setModalType('error');
        setModalMessage('La fecha de nacimiento no puede ser futura.');
        setShowModal(true);
        return;
      }
    }
    
    try {
      await onSave({
        nombres: personalForm.nombres,
        apellidoP: personalForm.apellidoP,
        apellidoM: personalForm.apellidoM,
        fechaNacimiento: personalForm.fechaNacimiento,
        licenciatura: personalForm.licenciatura
      });
      setIsEditingPersonal(false);
      
      // Show success modal
      setModalType('success');
      setModalMessage('La información personal se ha actualizado exitosamente.');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving personal info:', error);
      // Show error modal
      setModalType('error');
      setModalMessage(error.message || 'Error al guardar la información personal. Por favor, intente nuevamente.');
      setShowModal(true);
    }
  }

  /**
   * Validates required fields for contact information
   * @returns {boolean} True if valid, false otherwise
   */
  const validateContactInfo = () => {
    const missingFields = [];
    
    if (!contactForm.email || contactForm.email.trim() === '') {
      missingFields.push('Correo electrónico');
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactForm.email)) {
        setModalType('error');
        setModalMessage('El formato del correo electrónico no es válido.');
        setShowModal(true);
        return false;
      }
    }
    
    // Note: telefonoWhatsApp is required in membershipApplication, but we'll use telefono (telefonoCasa) here
    // If the backend expects telefonoWhatsApp, we may need to adjust
    
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }
    
    return true;
  };

  async function handleSaveContact() {
    if (!onSave) return;
    
    // Validate required fields
    if (!validateContactInfo()) {
      return;
    }
    
    try {
      await onSave({
        correo: contactForm.email,
        telefono: contactForm.telefono,
        instagram: contactForm.instagram,
        linkedin: contactForm.linkedin,
        facebook: contactForm.facebook,
        paginaWeb: contactForm.paginaWeb
      });
      setIsEditingContact(false);
      
      // Show success modal
      setModalType('success');
      setModalMessage('La información de contacto se ha actualizado exitosamente.');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving contact info:', error);
      // Show error modal
      setModalType('error');
      setModalMessage(error.message || 'Error al guardar la información de contacto. Por favor, intente nuevamente.');
      setShowModal(true);
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal information section */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información personal</h3>
          {canEdit && (
            <EditButton 
              isEditing={isEditingPersonal}
              onClick={() => setIsEditingPersonal((v) => !v)}
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
            {isEditingPersonal ? (
              <input 
                name="nombres" 
                value={personalForm.nombres} 
                onChange={handlePersonalChange} 
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" 
              />
            ) : (
              <div className="mt-1 text-slate-900">{data.nombres || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Apellidos
              <span className="text-red-500 ml-1">*</span>
            </label>
            {isEditingPersonal ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input 
                  name="apellidoP" 
                  value={personalForm.apellidoP} 
                  onChange={handlePersonalChange} 
                  placeholder="Apellido paterno" 
                  required
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" 
                />
                <input 
                  name="apellidoM" 
                  value={personalForm.apellidoM} 
                  onChange={handlePersonalChange} 
                  placeholder="Apellido materno" 
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" 
                />
              </div>
            ) : (
              <div className="mt-1 text-slate-900">{`${data.apellidoP || ''} ${data.apellidoM || ''}`.trim() || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">
              Fecha de nacimiento
              <span className="text-red-500 ml-1">*</span>
            </label>
            {isEditingPersonal ? (
              <input 
                type="date" 
                name="fechaNacimiento" 
                value={personalForm.fechaNacimiento} 
                onChange={handlePersonalChange}
                max={getMaxDate()}
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" 
              />
            ) : (
              <div className="mt-1 text-slate-900">
                {data.fechaNacimiento ? formatDate(data.fechaNacimiento) : <span className="text-slate-400">No disponible</span>}
              </div>
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
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditingPersonal(false);
                // Restore original values
                setPersonalForm({
                  nombres: data.nombres || '',
                  apellidoP: data.apellidoP || '',
                  apellidoM: data.apellidoM || '',
                  fechaNacimiento: formatDateForInput(data.fechaNacimiento) || '',
                  licenciatura: data.licenciatura || ''
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleSavePersonal}
            >
              Guardar
            </Button>
          </div>
        )}
      </section>

      {/* Contact information section */}
      <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Información de contacto</h3>
          {canEdit && (
            <EditButton 
              isEditing={isEditingContact}
              onClick={() => setIsEditingContact((v) => !v)}
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
            {isEditingContact ? (
              <input 
                name="email" 
                type="email"
                value={contactForm.email} 
                onChange={handleContactChange} 
                required
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" 
              />
            ) : (
              <div className="mt-1 text-slate-900">{data.email || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Teléfono</label>
            {isEditingContact ? (
              <input name="telefono" value={contactForm.telefono} onChange={handleContactChange} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" />
            ) : (
              <div className="mt-1 text-slate-900">{data.telefono || <span className="text-slate-400">No disponible</span>}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Instagram</label>
            {isEditingContact ? (
              <input name="instagram" value={contactForm.instagram} onChange={handleContactChange} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" />
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
              <input name="linkedin" value={contactForm.linkedin} onChange={handleContactChange} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" />
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
              <input name="facebook" value={contactForm.facebook} onChange={handleContactChange} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" />
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
              <input name="paginaWeb" value={contactForm.paginaWeb} onChange={handleContactChange} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent" />
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
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
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
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleSaveContact}
            >
              Guardar
            </Button>
          </div>
        )}
      </section>

      {/* Success/Error Modal */}
      <SuccessErrorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalMessage}
        title={
          modalType === "success"
            ? "¡Operación exitosa!"
            : "Error en la operación"
        }
      />

      {/* Validation Modal for Required Fields */}
      <Modal open={showValidationModal} onClose={() => setShowValidationModal(false)} size="md" position="center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            <svg className="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Campos requeridos faltantes
          </h3>
          <p className="text-gray-600 mb-6">
            Por favor completa los siguientes campos obligatorios antes de guardar:
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <ul className="text-left text-gray-700 space-y-2">
              {validationErrors.map((field, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="brand" onClick={() => setShowValidationModal(false)} className="w-full">
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
