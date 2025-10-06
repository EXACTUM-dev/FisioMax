/**
 * @fileoverview Vista para solicitud de membresía a SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React, { useState } from "react";
import Button from "../atoms/button";
import FormField from "../molecules/form";
import FileUpload from "../molecules/fileUpload";
import Dropdown from "../molecules/dropdown";
import { MEMBERSHIP_API } from "../config/api";

export default function MembershipApplicationPage() {
  const [formData, setFormData] = useState({
    // Mi perfil
    nombres: "Angélica",
    apellidos: "Hernández Callejas",
    telefono: "771 122 5154",
    email: "angynas@gmail.com",
    
    // Datos de domicilio
    pais: "México",
    estado: "Querétaro",
    ciudad: "Querétaro",
    colonia: "México",
    codigoPostal: "42383",
    
    // Licenciatura
    licenciatura: "",
    
    // Documentación
    titulo: null,
    cedula: null,
    constancias: null
  });

  // Opciones para los dropdowns
  const paises = [
    { value: "México", label: "México" },
    { value: "Estados Unidos", label: "Estados Unidos" },
    { value: "Canadá", label: "Canadá" },
    { value: "España", label: "España" },
    { value: "Colombia", label: "Colombia" },
    { value: "Argentina", label: "Argentina" }
  ];

  const estados = [
    { value: "Querétaro", label: "Querétaro" },
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Nuevo León", label: "Nuevo León" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Puebla", label: "Puebla" }
  ];

  const ciudades = [
    { value: "Querétaro", label: "Querétaro" },
    { value: "San Juan del Río", label: "San Juan del Río" },
    { value: "Corregidora", label: "Corregidora" },
    { value: "El Marqués", label: "El Marqués" },
    { value: "Pedro Escobedo", label: "Pedro Escobedo" }
  ];

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos requeridos
    if (!formData.nombres.trim()) newErrors.nombres = "El nombre es requerido";
    if (!formData.apellidos.trim()) newErrors.apellidos = "Los apellidos son requeridos";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.pais) newErrors.pais = "El país es requerido";
    if (!formData.estado) newErrors.estado = "El estado es requerido";
    if (!formData.ciudad) newErrors.ciudad = "La ciudad es requerida";
    if (!formData.titulo) newErrors.titulo = "El título es requerido";
    if (!formData.cedula) newErrors.cedula = "La cédula es requerida";
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }
    
    // Validar tamaño de archivos
    if (formData.titulo && formData.titulo.size > 10 * 1024 * 1024) {
      newErrors.titulo = "El archivo del título no puede ser mayor a 10MB";
    }
    if (formData.cedula && formData.cedula.size > 10 * 1024 * 1024) {
      newErrors.cedula = "El archivo de la cédula no puede ser mayor a 10MB";
    }
    if (formData.constancias && formData.constancias.size > 10 * 1024 * 1024) {
      newErrors.constancias = "El archivo de constancias no puede ser mayor a 10MB";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Agregar datos del formulario
      formDataToSend.append('nombres', formData.nombres);
      formDataToSend.append('apellidos', formData.apellidos);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('pais', formData.pais);
      formDataToSend.append('estado', formData.estado);
      formDataToSend.append('ciudad', formData.ciudad);
      formDataToSend.append('colonia', formData.colonia);
      formDataToSend.append('codigoPostal', formData.codigoPostal);
      formDataToSend.append('licenciatura', formData.licenciatura);
      
      // Agregar archivos si existen
      if (formData.titulo) {
        formDataToSend.append('titulo', formData.titulo);
      }
      if (formData.cedula) {
        formDataToSend.append('cedula', formData.cedula);
      }
      if (formData.constancias) {
        formDataToSend.append('constancias', formData.constancias);
      }

      // Enviar al backend
      const response = await fetch(MEMBERSHIP_API.CREATE, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        alert('¡Solicitud enviada correctamente! Te hemos enviado un email de confirmación.');
        // Limpiar formulario
        setFormData({
          nombres: "",
          apellidos: "",
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
        setErrors({});
      } else {
        alert(`Error al enviar la solicitud: ${result.message}`);
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Lógica para cancelar
    console.log("Solicitud cancelada");
  };

  const handleAddDocuments = () => {
    // Lógica para agregar documentos adicionales
    console.log("Agregar documentos");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo */}
      <div className="border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <img 
              src="../assets/icons/SOMEFIPPlogo.png"
              className="w-12 h-12 rounded-full object-cover"
            />
            <h1 className="text-center text-x font-semibold text-gray-800">
              Sociedad Mexicana de Fisioterapia en Piso Pélvico
            </h1>
          </div>
        </div>
      </div>

      

      {/* Contenido principal */}
      <div className=" max-w-4xl mx-auto px-6 py-8">
        <div className="">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Mi perfil */}
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-center text-2xl font-bold text-gray-800 mb-8" >Registro de solicitud</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi perfil</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    label="Nombre(s)"
                    name="nombres"
                    required={true}
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu(s) nombre(s)"
                  />
                  {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
                </div>
                
                <div>
                  <FormField
                    label="Apellidos *"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="Ingresa tus apellidos"
                  />
                  {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                
                <div>
                  <FormField
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu teléfono"
                  />
                </div>
                
                <div>
                  <FormField
                    label="Correo electrónico *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>



              {/* Sección: Datos de domicilio */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de domicilio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Dropdown
                  name="pais"
                  label="País"
                  required={true}
                  value={formData.pais}
                  onChange={handleInputChange}
                  options={paises}
                  placeholder="Selecciona un país"
                  error={errors.pais}
                />
                
                <Dropdown
                  name="estado"
                  label="Estado/Provincia"
                  required={true}
                  value={formData.estado}
                  onChange={handleInputChange}
                  options={estados}
                  placeholder="Selecciona un estado"
                  error={errors.estado}
                />
                
                <Dropdown
                  name="ciudad"
                  label="Ciudad"
                  required={true}
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  options={ciudades}
                  placeholder="Selecciona una ciudad"
                  error={errors.ciudad}
                />
                
                <div>
                  <FormField
                    label="Colonia"
                    name="colonia"
                    value={formData.colonia}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu colonia"
                  />
                </div>
                
                <div>
                  <FormField
                    label="Código Postal"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu código postal"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Licenciatura */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Licenciatura</h3>
              <div>
                <FormField
                  label="Licenciatura"
                  name="licenciatura"
                  value={formData.licenciatura}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu licenciatura"
                />
              </div>
            </div>

            {/* Sección: Documentación */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentación</h3>
              <div className="space-y-6">
                <FileUpload
                  name="titulo"
                  label="Título"
                  required={true}
                  value={formData.titulo}
                  onChange={handleFileChange}
                  error={errors.titulo}
                />

                <FileUpload
                  name="cedula"
                  label="Cédula"
                  required={true}
                  value={formData.cedula}
                  onChange={handleFileChange}
                  error={errors.cedula}
                />

                <FileUpload
                  name="constancias"
                  label="Constancias"
                  required={false}
                  value={formData.constancias}
                  onChange={handleFileChange}
                />

                <div className="pt-2">
                  <Button
                    variant="newDoc"
                    size="sm"
                    onClick={handleAddDocuments}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Agregar documentos
                  </Button>
                </div>
              </div>
            </div>

              {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                variant="cancel"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="brand"
                type="submit"
                disabled={isSubmitting}
                
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>

            </div>

            
          </form>
        </div>
      </div>

      {/* Footer con controles de visualización */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">100%</span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
