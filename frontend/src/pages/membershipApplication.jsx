/**
 * @fileoverview Vista para solicitud de membresía a SOMEFIPP
 * @version 1.0.2
 */
import React, { useState, useEffect } from "react";
import Button from "../atoms/button";
import FormField from "../molecules/form";
import FileUpload from "../molecules/fileUpload";
import Swal from "sweetalert2";
import { MEMBERSHIP_API } from "../config/api";
import logo from '../assets/icons/SOMEFIPPlogo.png';

// Componente reutilizable para selects
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


export default function MembershipApplicationPage() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoP: "",
    apellidoM: "",
    telefono: "",
    email: "",
    pais: "",
    estado: "",
    ciudad: "",
    colonia: "",
    codigoPostal: "",
    licenciatura: "",
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
        console.error("Error obteniendo países:", err);
      }
    };
    fetchCountries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

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
      console.error("Error obteniendo estados:", err);
      setStates([]);
    }
  };

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
      console.error("Error obteniendo ciudades:", err);
      setCities([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombres.trim()) newErrors.nombres = "El nombre es requerido";
    if (!formData.apellidoP.trim()) newErrors.apellidoP = "El apellido paterno es requerido";
    if (!formData.apellidoM.trim()) newErrors.apellidoM = "El apellido materno es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.pais) newErrors.pais = "El país es requerido";
    if (!formData.estado) newErrors.estado = "El estado es requerido";
    if (!formData.ciudad) newErrors.ciudad = "La ciudad es requerida";
    if (!formData.titulo) newErrors.titulo = "El título es requerido";
    if (!formData.cedula) newErrors.cedula = "La cédula es requerida";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "El formato del email no es válido";

    if (formData.titulo && formData.titulo.size > 10 * 1024 * 1024) newErrors.titulo = "El archivo del título no puede ser mayor a 10MB";
    if (formData.cedula && formData.cedula.size > 10 * 1024 * 1024) newErrors.cedula = "El archivo de la cédula no puede ser mayor a 10MB";
    if (formData.constancias && formData.constancias.size > 10 * 1024 * 1024) newErrors.constancias = "El archivo de constancias no puede ser mayor a 10MB";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

      if (result.success) {
        Swal.fire({ icon: "success", title: "¡Solicitud enviada!", text: "Tu solicitud fue registrada correctamente.", confirmButtonColor: "#2563eb" });
        setFormData({ nombres: "", apellidoP: "", apellidoM: "", telefono: "", email: "", pais: "", estado: "", ciudad: "", colonia: "", codigoPostal: "", licenciatura: "", titulo: null, cedula: null, constancias: null });
        setExtraDocs([]);
        setErrors({});
      } else {
        Swal.fire({ icon: "error", title: "Error al enviar", text: result.message || "Intenta nuevamente.", confirmButtonColor: "#dc2626" });
      }
    } catch (err) {
      console.error("Error enviando solicitud:", err);
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor.", confirmButtonColor: "#dc2626" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Se perderán todos los datos ingresados.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, continuar"
    }).then(result => {
      if (result.isConfirmed) {
        setFormData({ nombres: "", apellidoP: "", apellidoM: "", telefono: "", email: "", pais: "", estado: "", ciudad: "", colonia: "", codigoPostal: "", licenciatura: "", titulo: null, cedula: null, constancias: null });
        setExtraDocs([]);
        setErrors({});
        setStates([]);
        setCities([]);
        Swal.fire({ icon: "success", title: "Formulario cancelado", text: "Se han limpiado todos los campos.", confirmButtonColor: "#2563eb" });
      }
    });
  };

  const handleAddDocuments = () => setExtraDocs(prev => [...prev, { id: Date.now(), file: null }]);
  const handleExtraFileChange = (id, e) => {
    const file = e.target.files[0] || null;
    setExtraDocs(prev => prev.map(doc => doc.id === id ? { ...doc, file } : doc));
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
          {/* Mi perfil */}
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">Registro de solicitud</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre(s)" name="nombres" required value={formData.nombres} onChange={handleInputChange} placeholder="Ingresa tu(s) nombre(s)" error={errors.nombres} />
              <FormField label="Apellido Paterno" name="apellidoP" required value={formData.apellidoP} onChange={handleInputChange} placeholder="Ingresa tu apellido paterno" error={errors.apellidoP} />
              <FormField label="Apellido Materno" name="apellidoM" required value={formData.apellidoM} onChange={handleInputChange} placeholder="Ingresa tu apellido materno" error={errors.apellidoM} />
              <FormField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ingresa tu teléfono" />
              <FormField label="Correo electrónico" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="Ingresa tu email" error={errors.email} />
            </div>
          
            {/* Datos de domicilio */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-5">Datos de domicilio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="País"
                name="pais"
                value={formData.pais}
                onChange={(e) => handlePaisChange(e.target.value)}
                options={countries}
                required
                error={errors.pais}
              />

              <SelectField
                label="Estado / Provincia"
                name="estado"
                value={formData.estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                options={states}
                required
                error={errors.estado}
              />

              <SelectField
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                options={cities}
                required
                error={errors.ciudad}
              />

              <FormField
                label="Colonia"
                name="colonia"
                value={formData.colonia}
                onChange={handleInputChange}
                placeholder="Ingresa tu colonia"
              />

              <FormField
                label="Código Postal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                placeholder="Ingresa tu código postal"
              />
            </div>

          {/* Licenciatura */}
            <FormField label="Licenciatura" name="licenciatura" value={formData.licenciatura} onChange={handleInputChange} placeholder="Ingresa tu licenciatura" />

          {/* Documentación */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Documentación</h3>
            <div className="space-y-6">
              <FileUpload name="titulo" label="Título" required value={formData.titulo} onChange={handleFileChange} error={errors.titulo} />
              <FileUpload name="cedula" label="Cédula" required value={formData.cedula} onChange={handleFileChange} error={errors.cedula} />
              <FileUpload name="constancias" label="Constancias" required={false} value={formData.constancias} onChange={handleFileChange} />
              {extraDocs.map((doc, i) => (
                <div key={doc.id} className="relative">
                  <FileUpload name={`extra-${doc.id}`} label={`Documento adicional ${i+1}`} value={doc.file} onChange={(e) => handleExtraFileChange(doc.id, e)} />
                  <button type="button" onClick={() => setExtraDocs(prev => prev.filter(d => d.id !== doc.id))} className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-sm mt-1 mr-1">✕</button>
                </div>
              ))}
              <Button variant="newDoc" size="sm" onClick={handleAddDocuments} className="bg-gray-200 text-gray-700 hover:bg-gray-300" type="button">Agregar documentos</Button>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="cancel" onClick={handleCancel}>Cancelar</Button>
                <Button variant="brand" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar'}</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
