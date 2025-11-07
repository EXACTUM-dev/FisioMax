/**
 * @fileoverview Upload multimedia content page for administrators
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import BackButton from "../atoms/backButton";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";
import Dropdown from "../molecules/dropdown";

// Organisms
import SuccessErrorModal from "../organisms/successErrorModal";

/**
 * Component for uploading multimedia content with role-based access control.
 * Allows administrators to upload files, set metadata, and assign content to specific roles.
 *
 * @returns {JSX.Element} The upload multimedia page component
 */
export default function UploadMultimedia() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("uploadMultimedia");

  /** Form state for content metadata */
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Articulo",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Modal states
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedContentName, setUploadedContentName] = useState("");

  /**
   * Fetches available roles from the API on component mount.
   * Roles are used to determine content access permissions.
   */
  useEffect(() => {
    async function fetchRoles() {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setRoles(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }
    if (isLoaded) {
      fetchRoles();
    }
  }, [isLoaded, getToken]);

  /**
   * Updates form data when input fields change.
   *
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles file selection from the file input.
   *
   * @param {Event} e - The file input change event
   * @param {string} type - Type of file ('content' or 'thumbnail')
   */
  const handleFileChange = (e, type = "content") => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size based on type
      let maxSize;
      let maxSizeLabel;

      if (type === "thumbnail") {
        maxSize = 20 * 1024 * 1024; // 20MB for thumbnails
        maxSizeLabel = "20MB";
      } else {
        maxSize = 5 * 1024 * 1024 * 1024; // 5GB for content files
        maxSizeLabel = "5GB";
      }

      if (file.size > maxSize) {
        setErrorMessage(
          `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeLabel}.`
        );
        setErrorModalOpen(true);
        e.target.value = ""; // Clear the input
        return;
      }

      if (type === "thumbnail") {
        setSelectedThumbnail(file);
      } else {
        setSelectedFile(file);
      }
    }
  };

  /**
   * Handles role selection change from checkbox.
   *
   * @param {string} roleId - The role ID to toggle
   */
  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        // Remove role if already selected
        return prev.filter((id) => id !== roleId);
      } else {
        // Add role if not selected
        return [...prev, roleId];
      }
    });
  };

  /**
   * Handles form submission and uploads content to the server.
   * Validates required fields before submission and sends file with metadata.
   * Resets form state on successful upload.
   *
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.nombre.trim()) {
      setErrorMessage("El nombre del archivo es obligatorio");
      setErrorModalOpen(true);
      return;
    }

    if (formData.nombre.length > 50) {
      setErrorMessage(
        "El nombre del archivo no puede exceder los 50 caracteres"
      );
      setErrorModalOpen(true);
      return;
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      setErrorMessage("La descripción no puede exceder los 500 caracteres");
      setErrorModalOpen(true);
      return;
    }

    if (!formData.tipo) {
      setErrorMessage("El tipo de contenido es obligatorio");
      setErrorModalOpen(true);
      return;
    }

    if (!selectedRoles || selectedRoles.length === 0) {
      setErrorMessage("Debes seleccionar al menos un rol al que va dirigido el contenido");
      setErrorModalOpen(true);
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Debes seleccionar un archivo de contenido");
      setErrorModalOpen(true);
      return;
    }

    try {
      setUploading(true);
      const token = await getToken();

      // Sanitize and prepare multipart form data with file and metadata
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("nombre", formData.nombre.trim());
      uploadData.append("descripcion", formData.descripcion.trim());
      uploadData.append("tipo", formData.tipo);
      uploadData.append("roles", JSON.stringify(selectedRoles));

      // Add thumbnail if selected
      if (selectedThumbnail) {
        uploadData.append("thumbnail", selectedThumbnail);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/content/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const result = await response.json();

      if (result.success) {
        // Save content name before resetting form
        setUploadedContentName(formData.nombre);

        // Reset form to initial state
        setFormData({
          nombre: "",
          descripcion: "",
          tipo: "Articulo",
        });
        setSelectedFile(null);
        setSelectedThumbnail(null);
        setSelectedRoles([]);

        // Show success modal
        setSuccessModalOpen(true);
      } else {
        setErrorMessage(result.message || "Error al subir el contenido");
        setErrorModalOpen(true);
      }
    } catch (error) {
      console.error("Error uploading content:", error);
      setErrorMessage(
        "Error al subir el contenido. Por favor, intenta nuevamente."
      );
      setErrorModalOpen(true);
    } finally {
      setUploading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: "#CAD00F" }}
          ></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <AppHeader user={user} />

      {/* Sidebar */}
      <Sidebar current={current} onNavigate={setCurrent} />

      {/* Main content */}
      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <BackButton onClick={() => navigate(-1)} />
            <Title2 className="mb-0">Subir nuevo contenido multimedia</Title2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              {/* Content name field */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Nombre del archivo <span className="text-red-500">*</span>
                </h3>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej. Introducción a la Fisioterapia Pélvica"
                  maxLength={50}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.nombre.length}/50 caracteres
                </p>
              </div>

              {/* Content description field */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Descripción
                </h3>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Escribe una breve descripción del contenido"
                  rows="6"
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.descripcion.length}/500 caracteres
                </p>
              </div>

              {/* Content type and role selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Content type selector */}
                <div>
                  <Dropdown
                    name="tipo"
                    label="Tipo de contenido"
                    required={true}
                    value={formData.tipo}
                    onChange={handleInputChange}
                    options={[
                      { value: "Articulo", label: "Artículo" },
                      { value: "Video", label: "Video" },
                      { value: "Podcast", label: "Podcast" },
                      { value: "Libro", label: "Libro" },
                    ]}
                    placeholder="Selecciona un tipo"
                  />
                </div>

                {/* Role selector */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Dirigido a <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-2 border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {roles.length === 0 ? (
                      <p className="text-sm text-slate-500">Cargando roles...</p>
                    ) : (
                      roles.map((role) => (
                        <label
                          key={role.IDRol || role.id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.IDRol || role.id)}
                            onChange={() => handleRoleToggle(role.IDRol || role.id)}
                            className="checkbox-brand"
                          />
                          <span className="text-sm text-slate-700">
                            {role.nombre || role.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedRoles.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      {selectedRoles.length} {selectedRoles.length === 1 ? 'rol seleccionado' : 'roles seleccionados'}
                    </p>
                  )}
                </div>
              </div>

              {/* Main content file upload area */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Archivo del contenido <span className="text-red-500">*</span>
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 transition-colors hover:border-[#CAD00F]">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "content")}
                    className="hidden"
                    id="file-upload"
                    accept="video/*,audio/*,image/*,.pdf,.doc,.docx"
                    required
                  />
                  
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          document.getElementById('file-upload').value = '';
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="mt-2">
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-sm font-medium text-[#CAD00F] hover:text-[#b8bc0d]"
                        >
                          Haz clic para seleccionar archivo
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          o arrastra y suelta aquí
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        MP4, MOV, WEBP, PDF hasta 5GB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail image upload area */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Miniatura del contenido
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 transition-colors hover:border-[#CAD00F]">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                    className="hidden"
                    id="thumbnail-upload"
                    accept="image/png,image/jpeg,image/jpg"
                  />
                  
                  {selectedThumbnail ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedThumbnail.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedThumbnail.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedThumbnail(null);
                          document.getElementById('thumbnail-upload').value = '';
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="mt-2">
                        <label
                          htmlFor="thumbnail-upload"
                          className="cursor-pointer text-sm font-medium text-[#CAD00F] hover:text-[#b8bc0d]"
                        >
                          Haz clic para seleccionar archivo
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          o arrastra y suelta aquí
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG hasta 20MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form action buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      nombre: "",
                      descripcion: "",
                      tipo: "Articulo",
                    });
                    setSelectedFile(null);
                    setSelectedThumbnail(null);
                    setSelectedRoles([]);
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" disabled={uploading}>
                  {uploading ? "Subiendo..." : "Subir contenido"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessErrorModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        type="success"
        title="¡Contenido subido exitosamente!"
        message={`El contenido "${uploadedContentName}" ha sido subido correctamente y estará disponible para los usuarios.`}
        confirmLabel="Entendido"
      />

      {/* Error Modal */}
      <SuccessErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        type="error"
        title="Error al subir contenido"
        message={errorMessage}
        confirmLabel="Cerrar"
      />
    </div>
  );
}
