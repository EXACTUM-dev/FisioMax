/**
 * @fileoverview Upload multimedia content page for administrators
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

// Atoms
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";

// Molecules
import Sidebar from "../molecules/sidebar";
import AppHeader from "../molecules/appHeader";

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
  const [current, setCurrent] = useState("uploadMultimedia");

  /** Form state for content metadata */
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Articulo",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
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
   * Handles role selection change from dropdown.
   *
   * @param {Event} e - The select change event
   */
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
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

    if (!selectedRole) {
      setErrorMessage("Debes seleccionar a quién va dirigido el contenido");
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
      uploadData.append("role", selectedRole);

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
        setSelectedRole("");

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
          <Title2 className="mb-6">Subir nuevo contenido multimedia</Title2>

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
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Tipo de contenido <span className="text-red-500">*</span>
                  </h3>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent bg-white"
                    required
                  >
                    <option value="Articulo">Artículo</option>
                    <option value="Video">Video</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Documento">Documento</option>
                  </select>
                </div>

                {/* Role selector */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Dirigido a <span className="text-red-500">*</span>
                  </h3>
                  <select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {roles.map((role) => (
                      <option
                        key={role.IDRol || role.id}
                        value={role.IDRol || role.id}
                      >
                        {role.nombre || role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main content file upload area */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Archivo del contenido <span className="text-red-500">*</span>
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#CAD00F] transition-colors">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "content")}
                    className="hidden"
                    id="file-upload"
                    accept="video/*,audio/*,image/*,.pdf,.doc,.docx"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-slate-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {selectedFile ? (
                      <span className="text-sm font-medium text-slate-700">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="text-[#CAD00F] font-medium">
                            Sube un archivo
                          </span>{" "}
                          o arrástralo aquí
                        </p>
                        <p className="text-xs text-slate-500">
                          MP4, MOV, WEBP, PDF hasta 5GB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Thumbnail image upload area */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Miniatura del contenido
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#CAD00F] transition-colors">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                    className="hidden"
                    id="thumbnail-upload"
                    accept="image/png,image/jpeg,image/jpg"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-slate-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {selectedThumbnail ? (
                      <span className="text-sm font-medium text-slate-700">
                        {selectedThumbnail.name}
                      </span>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="text-[#CAD00F] font-medium">
                            Sube una imagen
                          </span>{" "}
                          o arrástrala aquí
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG hasta 20MB
                        </p>
                      </>
                    )}
                  </label>
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
                    setSelectedRole("");
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
