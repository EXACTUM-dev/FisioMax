/**
 * @fileoverview Membership application form for SOMEFIPP (Mexican Society of Pelvic Floor Physiotherapy).
 * @version 1.0.3
 * @description This component handles the membership application process including:
 * - Required field validation
 * - Modal state management for success/error messages
 * - Format verification for email and file uploads
 * - Support for additional documents
 * - Confirmation modal for unsaved data protection
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/button";
import FormField from "../molecules/form";
import FileUpload from "../molecules/fileUpload";
import Modal from "../molecules/modal";
import ConfirmModal from "../molecules/confirmationModal";
import { MEMBERSHIP_API } from "../config/api";
import logo from '../assets/icons/SOMEFIPPlogo.png';

//  Variables for country, state and city APIs
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
 * @param {Object} props - Component props.
 * @param {string} props.label - Field label.
 * @param {string} props.name - Field name.
 * @param {string} props.value - Current value.
 * @param {Function} props.onChange - Change handler.
 * @param {Array<{value: string, label: string}>} props.options - Options array.
 * @param {boolean} props.required - Whether field is required.
 * @param {string} props.error - Error message.
 * @returns {JSX.Element} Select field component.
 */
const SelectField = ({ label, name, value, onChange, options, required, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
    >
      <option value="">Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

/**
 * Combobox field component for dropdown with custom input option.
 * @param {Object} props - Component props.
 * @param {string} props.label - Field label.
 * @param {string} props.name - Field name.
 * @param {string} props.value - Current value.
 * @param {Function} props.onChange - Change handler.
 * @param {Array<string>} props.options - Options array.
 * @param {boolean} props.required - Whether field is required.
 * @param {string} props.error - Error message.
 * @param {string} props.placeholder - Placeholder text.
 * @returns {JSX.Element} Combobox field component.
 */
const ComboboxField = ({ label, name, value, onChange, options, required, error, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [inputValue, setInputValue] = useState(value);

  // Filter options based on input
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

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Call parent onChange
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
    
    // Call parent onChange
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
    // Delay closing to allow option click
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
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
 * Main membership application page component.
 * @returns {JSX.Element} Membership application form.
 */
export default function MembershipApplicationPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoP: "",
    apellidoM: "",
    telefonoCasa: "",
    telefonoWhatsApp: "",
    email: "",
    fechaNacimiento: "",
    pais: "",
    estado: "",
    ciudad: "",
    calle: "",
    numExterior: "",
    numInterior: "",
    colonia: "",
    codigoPostal: "",
    licenciatura: "",
    instagram: "",
    linkedin: "",
    facebook: "",
    paginaWeb: "",
    titulo: null,
    cedula: null,
    constancias: null
  });

  const [extraDocs, setExtraDocs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const isNavigatingRef = useRef(false);
  
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * Checks if the form has any data entered.
   * @returns {boolean} True if form has data, false otherwise.
   */
  const hasFormData = () => {
    const hasTextData = Object.entries(formData).some(([key, value]) => {
      if (key === 'titulo' || key === 'cedula' || key === 'constancias') return false;
      return typeof value === 'string' && value.trim() !== '';
    });
    const hasFiles = formData.titulo || formData.cedula || formData.constancias || extraDocs.length > 0;
    return hasTextData || hasFiles;
  };

  /**
   * Detects when user attempts to close the tab/window.
   * Shows browser confirmation dialog if form has unsaved data.
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasFormData() && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, extraDocs]);

  /**
   * Detects browser back button navigation.
   * Shows confirmation modal if form has unsaved data.
   */
  useEffect(() => {
    const handlePopState = () => {
      if (hasFormData() && !isNavigatingRef.current) {
        setShowConfirmModal(true);
    
        window.history.pushState(null, '', window.location.href);
      }
    };

    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [formData, extraDocs]);

  /**
   * Fetches countries list on component mount.
   */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${COUNTRIES_API_BASE_URL}${COUNTRIES_POSITIONS_ENDPOINT}`);
        const data = await res.json();
        const formatted = data.data
          .map(c => ({ value: c.name, label: c.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(formatted);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  /**
   * Handles input field changes.
   * @param {Event} e - Input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /**
   * Handles file upload changes with validation.
   * @param {Event} e - File input change event.
   */
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0] || null;
    
    setFormData(prev => ({ ...prev, [name]: file }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, [name]: "Solo se aceptan archivos PDF" }));
      } else if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: "El archivo no puede ser mayor a 10MB" }));
      }
    }
  };

  /**
   * Handles country selection and fetches states for that country.
   * @param {string} value - Selected country name.
   */
  const handlePaisChange = async (value) => {
    setFormData(prev => ({ ...prev, pais: value, estado: "", ciudad: "" }));
    setStates([]);
    setCities([]);
    try {
      const res = await fetch(`${COUNTRIES_API_BASE_URL}${COUNTRIES_STATES_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: value })
      });
      const data = await res.json();
      const formattedStates = data.data?.states?.map(s => ({ value: s.name, label: s.name })) || [];
      setStates(formattedStates);
    } catch (err) {
      console.error("Error fetching states:", err);
      setStates([]);
    }
  };

  /**
   * Handles state selection and fetches cities for that state.
   * @param {string} value - Selected state name.
   */
  const handleEstadoChange = async (value) => {
    setFormData(prev => ({ ...prev, estado: value, ciudad: "" }));
    setCities([]);
    try {
      const res = await fetch(`${COUNTRIES_API_BASE_URL}${COUNTRIES_CITIES_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: formData.pais, state: value })
      });
      const data = await res.json();
      const formattedCities = data.data?.map(c => ({ value: c, label: c })) || [];
      setCities(formattedCities);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setCities([]);
    }
  };

  /**
   * Validates form data including required fields, email format, and file uploads.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};
    const missingFields = [];
    
    if (!formData.nombres) {
      newErrors.nombres = "El nombre es requerido";
      missingFields.push("Nombre(s)");
    }
    if (!formData.apellidoP) {
      newErrors.apellidoP = "El apellido paterno es requerido";
      missingFields.push("Apellido Paterno");
    }
    if (!formData.email) {
      newErrors.email = "El email es requerido";
      missingFields.push("Correo electrónico");
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
      missingFields.push("Fecha de nacimiento");
    }
    if (!formData.telefonoWhatsApp) {
      newErrors.telefonoWhatsApp = "El contacto personal es requerido";
      missingFields.push("Contacto personal");
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
      missingFields.push("Fecha de nacimiento");
    }
    if (!formData.titulo) {
      newErrors.fechaNacimiento = "El título es requerida";
      missingFields.push("Título");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      newErrors.correo = "El formato del email no es válido";
      missingFields.push("El formato del correo no es válido");
    }
    
    if (!formData.cedula) {
    } else if (formData.cedula.type !== 'application/pdf') {
      newErrors.cedula = "Solo se aceptan archivos PDF";
    } else if (formData.cedula.size > 10 * 1024 * 1024) {
      newErrors.cedula = "El archivo no puede ser mayor a 10MB";
    }

    if (!formData.titulo) {
      newErrors.titulo = "El título es requerido";
      missingFields.push("Título/Kardex");
    } else if (formData.titulo.type !== 'application/pdf') {
      newErrors.titulo = "Solo se aceptan archivos PDF";
    } else if (formData.titulo.size > 10 * 1024 * 1024) {
      newErrors.titulo = "El archivo no puede ser mayor a 10MB";
    }

    if (formData.constancias) {
      if (formData.constancias.type !== 'application/pdf') {
        newErrors.constancias = "Solo se aceptan archivos PDF";
      } else if (formData.constancias.size > 10 * 1024 * 1024) {
        newErrors.constancias = "El archivo no puede ser mayor a 10MB";
      }
    }
    
    setErrors(newErrors);
    
    // If there are missing fields, display the missing fields modal
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }
    
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and sends data to the API.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      const fieldMapping = {
        nombres: 'firstName',
        apellidoP: 'lastName',
        apellidoM: 'middleName',
        telefonoCasa: 'homePhone',
        telefonoWhatsApp: 'whatsappPhone',
        email: 'email',
        fechaNacimiento: 'birthDate',
        pais: 'country',
        estado: 'state',
        ciudad: 'city',
        colonia: 'neighborhood',
        codigoPostal: 'postalCode',
        calle: 'street',
        numeroExterior: 'exteriorNumber',
        numeroInterior: 'interiorNumber',
        licenciatura: 'degree',
        instagram: 'instagram',
        linkedin: 'linkedin',
        facebook: 'facebook',
        paginaWeb: 'website',
        titulo: 'degreeDocument',
        cedula: 'professionalId',
        constancias: 'certificates'
      };
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          const englishKey = fieldMapping[key] || key;
          formDataToSend.append(englishKey, typeof value === "string" ? value.trim() : value);
        }
      });
      
      extraDocs.forEach((doc, i) => { if (doc.file) formDataToSend.append(`extraDoc${i+1}`, doc.file); });

      const res = await fetch(MEMBERSHIP_API.CREATE, { method: 'POST', body: formDataToSend });
      const result = await res.json();

      if (res.ok) {
        setModalType("success");
        setModalMessage(result.message || "Tu solicitud de membresía ha sido enviada exitosamente. Recibirá un mensaje por WhatsApp.");
        setShowModal(true);
        setExtraDocs([]);
      } else if (res.status === 409) {
    
        setModalType("error");
        setModalMessage("Este correo o teléfono ya está registrado");
        setShowModal(true);
      } else {
        setModalType("error");
        setModalMessage(result.message || "Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.");
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error enviando solicitud:", err);
      setModalType("error");
      setModalMessage("No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.");
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Closes the success/error modal and navigates to login on success.
   */
  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === "success") {
      navigate("/login");
    }
  };

  /**
   * Confirms exit and clears all form data before navigating to login.
   */
  const handleConfirmExit = () => {
    isNavigatingRef.current = true;
    setShowConfirmModal(false);
    
  
    setFormData({
      nombres: "",
      apellidoP: "",
      apellidoM: "",
      telefonoCasa: "",
      telefonoWhatsApp: "",
      email: "",
      fechaNacimiento: "",
      pais: "",
      estado: "",
      ciudad: "",
      calle: "",
      numExterior: "",
      numInterior: "",
      colonia: "",
      codigoPostal: "",
      licenciatura: "",
      instagram: "",
      linkedin: "",
      facebook: "",
      paginaWeb: "",
      titulo: null,
      cedula: null,
      constancias: null
    });
    setExtraDocs([]);
    setErrors({});
    setStates([]);
    setCities([]);
    
  
    navigate("/login");
  };

  /**
   * Cancels exit and keeps user on the form.
   */
  const handleCancelExit = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  /**
   * Closes the validation modal.
   */
  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors([]);
  };

  /**
   * Adds a new extra document field to the form.
   */
  const handleAddDocuments = () => setExtraDocs(prev => [...prev, { id: Date.now(), file: null }]);

  /**
   * Handles file change for extra documents with validation.
   * @param {number} id - Document ID.
   * @param {Event} e - File input change event.
   */
  const handleExtraFileChange = (id, e) => {
    const file = e.target.files[0] || null;
    const index = extraDocs.findIndex(doc => doc.id === id);
  
    setExtraDocs(prev => prev.map(doc => doc.id === id ? { ...doc, file } : doc));
  
    if (errors[`extraDoc${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`extraDoc${index}`];
        return newErrors;
      });
    }

    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ 
          ...prev, 
          [`extraDoc${index}`]: "Solo se aceptan archivos PDF" 
        }));
      } else if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          [`extraDoc${index}`]: "El archivo no puede ser mayor a 10MB" 
        }));
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <img src={logo} alt="SOMEFIPP Logo" className="w-12 h-12 rounded-full object-cover" />
            <h1 className="text-center text-xl font-semibold text-gray-800 ml-3">
              Sociedad Mexicana de Fisioterapia en Piso Pélvico
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* My profile */}
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">Registro de solicitud</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Nombre(s)" name="nombres" required value={formData.nombres} onChange={handleInputChange} placeholder="Ingresa tu(s) nombre(s)" error={errors.nombres}   
              />
              <FormField 
                label="Apellido Paterno" name="apellidoP" required value={formData.apellidoP} onChange={handleInputChange} placeholder="Ingresa tu apellido paterno" error={errors.apellidoP} 
              />
              <FormField 
                label="Apellido Materno" name="apellidoM" value={formData.apellidoM} onChange={handleInputChange} placeholder="Ingresa tu apellido materno" error={errors.apellidoM} 
              />
              <FormField 
                label="Correo electrónico" name="email" type="email" required value={formData.correo} onChange={handleInputChange} placeholder="Ingresa tu email" error={errors.correo}
              />
              <FormField 
                label="Fecha de nacimiento" name="fechaNacimiento" type="date" required value={formData.fechaNacimiento} onChange={handleInputChange} error={errors.fechaNacimiento}
              />
              <FormField 
                label="Contacto profesional(Teléfono de oficina)" name="telefonoCasa" value={formData.telefonoCasa} onChange={handleInputChange} placeholder="Ingresa tu teléfono" error={errors.telefonoCasa}
              />
               <FormField 
                label="Contacto personal(WhatsApp)" name="telefonoWhatsApp" required value={formData.telefonoWhatsApp} onChange={handleInputChange} placeholder="Ingresa tu teléfono" error={errors.telefonoWhatsApp}
              />
              <FormField 
                label="Facebook" name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="Ingresa tu cuenta de Facebook"
              />
              <FormField 
                label="Instagram" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="Ingresa tu cuenta de Instagram"
              />
              <FormField 
                label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="Ingresa tu cuenta de LinkedIn"
              />
              <FormField 
                label="Página web" name="paginaWeb" value={formData.paginaWeb} onChange={handleInputChange} placeholder="Ingresa tu página web"
              />
            </div>
          
            {/* Professional practice location section */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-5">Ubicación de práctica profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="País" name="pais" required value={formData.pais} onChange={(e) => handlePaisChange(e.target.value)} options={countries} error={errors.pais}
              />
              <SelectField
                label="Estado / Provincia" name="estado" required value={formData.estado} onChange={(e) => handleEstadoChange(e.target.value)} options={states} error={errors.estado}
              />
              <SelectField
                label="Ciudad" name="ciudad" required value={formData.ciudad} onChange={handleInputChange} options={cities} error={errors.ciudad}
              />
              <FormField
                label="Colonia" name="colonia" value={formData.colonia} onChange={handleInputChange} placeholder="Ingresa tu colonia"
              />
              <FormField
                label="Código Postal" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} placeholder="Ingresa tu código postal"
              />
              <FormField
                label="Calle" name="calle" value={formData.calle} onChange={handleInputChange} placeholder="Ingresa tu calle"
              />
              <FormField
                label="Número exterior" name="numExterior" value={formData.numExterior} onChange={handleInputChange} placeholder="Ingresa tu número exterior"
              />
              <FormField
                label="Número interior" name="numInterior" value={formData.numInterior} onChange={handleInputChange} placeholder="Ingresa tu número interior"
              />
            </div>

          {/* License section */}
            <ComboboxField 
              label="Licenciatura" 
              name="licenciatura" 
              value={formData.licenciatura} 
              onChange={handleInputChange} 
              options={CAREER_OPTIONS}
              placeholder="Selecciona o escribe tu licenciatura" 
            />

          {/* Documentation section */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Documentación</h3>
            <div className="space-y-6">
              <FileUpload name="titulo" label="Título/Kardex" required value={formData.titulo} onChange={handleFileChange} error={errors.titulo} />
              <FileUpload name="cedula" label="Cédula profesional" value={formData.cedula} onChange={handleFileChange} error={errors.cedula} />
              <FileUpload name="constancias" label="Constancias pélvicas" value={formData.constancias} onChange={handleFileChange} error={errors.constancias}/>
              {extraDocs.map((doc, i) => (
              <div key={doc.id} className="relative">
                <FileUpload 
                  name={`extra-${doc.id}`} 
                  label={`Documento adicional ${i+1}`} 
                  value={doc.file} 
                  onChange={(e) => handleExtraFileChange(doc.id, e)}
                  error={errors[`extraDoc${i}`]}
                />
                <button 
                  type="button" 
                  onClick={() => setExtraDocs(prev => prev.filter(d => d.id !== doc.id))} 
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-sm mt-1 mr-1"
                >
                  ✕
                </button>
              </div>
            ))}
              <Button variant="newDoc" size="sm" onClick={handleAddDocuments} className="bg-gray-200 text-gray-700 hover:bg-gray-300" type="button">Agregar documentos adicionales</Button>

              {/* Submit button section */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="brand" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar'}</Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Modal open={showModal} onClose={handleCloseModal} size="md" position="center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            {modalType === "success" ? (
              <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {modalType === "success" ? "¡Solicitud enviada!" : "Error al enviar"}
          </h3>
          <p className="text-gray-600 mb-6">
            {modalMessage}
          </p>
          <Button variant="brand" onClick={handleCloseModal}  className="w-full">
            {modalType === "success" ? "Entendido" : "Intentar nuevamente"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={showConfirmModal}
        title="¿Deseas salir de esta página?"
        message="Tienes información sin guardar. Si sales ahora, perderás todos los datos ingresados."
        confirmLabel="Sí, salir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* Modal to show validate required fields empty */}
      <Modal open={showValidationModal} onClose={handleCloseValidationModal} size="md" position="center">
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
            Por favor completa los siguientes campos obligatorios antes de enviar tu solicitud:
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
          <Button variant="brand" onClick={handleCloseValidationModal} className="w-full">
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}