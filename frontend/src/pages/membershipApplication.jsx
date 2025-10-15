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
    pais: "",
    estado: "",
    ciudad: "",
    calle: "",
    numExterior: "",
    numInterior: "",
    colonia: "",
    codigoPostal: "",
    numeroExterior: "",
    numeroInterior: "",
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
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
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
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
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
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
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
    
    if (!formData.nombres) newErrors.nombres = "El nombre es requerido";
    if (!formData.apellidoP) newErrors.apellidoP = "El apellido paterno es requerido";
    if (!formData.email) newErrors.email = "El email es requerido";
    if (!formData.telefonoWhatsApp) newErrors.telefonoWhatsApp = "El teléfono (WhatsApp) es requerido";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "El formato del email no es válido";
    if (!formData.cedula) {
      newErrors.cedula = "La cédula es requerida";
    } else if (formData.cedula.type !== 'application/pdf') {
      newErrors.cedula = "Solo se aceptan archivos PDF";
    } else if (formData.cedula.size > 10 * 1024 * 1024) {
      newErrors.cedula = "El archivo no puede ser mayor a 10MB";
    }

    if (formData.titulo) {
      if (formData.titulo.type !== 'application/pdf') {
        newErrors.titulo = "Solo se aceptan archivos PDF";
      } else if (formData.titulo.size > 10 * 1024 * 1024) {
        newErrors.titulo = "El archivo no puede ser mayor a 10MB";
      }
    }

    if (formData.constancias) {
      if (formData.constancias.type !== 'application/pdf') {
        newErrors.constancias = "Solo se aceptan archivos PDF";
      } else if (formData.constancias.size > 10 * 1024 * 1024) {
        newErrors.constancias = "El archivo no puede ser mayor a 10MB";
      }
    }
    setErrors(newErrors);
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
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, typeof value === "string" ? value.trim() : value);
      });
      extraDocs.forEach((doc, i) => { if (doc.file) formDataToSend.append(`extraDoc${i+1}`, doc.file); });

      const res = await fetch(MEMBERSHIP_API.CREATE, { method: 'POST', body: formDataToSend });
      const result = await res.json();

      if (res.ok) {
        setModalType("success");
        setModalMessage(result.message || "Tu solicitud de membresía ha sido enviada exitosamente. Recibirá un mensaje por correo o WhatsApp.");
        setShowModal(true);
        setExtraDocs([]);
      } else if (res.status === 409) {
    
        setModalType("error");
        setModalMessage("Este corero o teléfono ya está registrado");
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
      pais: "",
      estado: "",
      ciudad: "",
      calle: "",
      numExterior: "",
      numInterior: "",
      colonia: "",
      codigoPostal: "",
      numeroExterior: "",
      numeroInterior: "",
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
                label="Apellido Materno" name="apellidoM" required value={formData.apellidoM} onChange={handleInputChange} placeholder="Ingresa tu apellido materno" error={errors.apellidoM} 
              />
              <FormField 
                label="Correo electrónico" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="Ingresa tu email" error={errors.email}
              />
              <FormField 
                label="Teléfono personal" name="telefonoCasa" value={formData.telefonoCasa} onChange={handleInputChange} placeholder="Ingresa tu teléfono" error={errors.telefonoCasa}
              />
               <FormField 
                label="Teléfono (WhatsApp)" name="telefonoWhatsApp" required value={formData.telefonoWhatsApp} onChange={handleInputChange} placeholder="Ingresa tu teléfono" error={errors.telefonoWhatsApp}
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
                label="País" name="pais" value={formData.pais} onChange={(e) => handlePaisChange(e.target.value)} options={countries} error={errors.pais}
              />
              <SelectField
                label="Estado / Provincia" name="estado" value={formData.estado} onChange={(e) => handleEstadoChange(e.target.value)} options={states} error={errors.estado}
              />
              <SelectField
                label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleInputChange} options={cities} error={errors.ciudad}
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
                label="Número exterior" name="numeroExterior" value={formData.numeroExterior} onChange={handleInputChange} placeholder="Ingresa tu número exterior"
              />
              <FormField
                label="Número interior" name="numeroInterior" value={formData.numeroInterior} onChange={handleInputChange} placeholder="Ingresa tu número interior"
              />
            </div>

          {/* License section */}
            <FormField label="Licenciatura" name="licenciatura" value={formData.licenciatura} onChange={handleInputChange} placeholder="Ingresa tu licenciatura" />

          {/* Documentation section */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Documentación</h3>
            <div className="space-y-6">
              <FileUpload name="titulo" label="Título/Kardex" value={formData.titulo} onChange={handleFileChange} error={errors.titulo} />
              <FileUpload name="cedula" label="Cédula profesional" required value={formData.cedula} onChange={handleFileChange} error={errors.cedula} />
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
    </div>
  );
}