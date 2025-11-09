/**
 * @fileoverview Upload multimedia content page for administrators
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useEffect, useState, useRef } from "react";
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
import ConfirmModal from "../molecules/confirmationModal";
import FormField from "../molecules/form";

// Organisms
import SuccessErrorModal from "../organisms/successErrorModal";

// Utilities
import {
  CONTENT_FIELD_MAX_LENGTHS,
  CONTENT_TYPE_OPTIONS,
  ACCEPTED_CONTENT_TYPES,
  ACCEPTED_THUMBNAIL_TYPES,
  handleContentInputChange,
  handleContentFileChange,
  handleContentRoleToggle,
  validateContentForm,
  hasContentErrors,
} from "../utils/contentValidation";

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
  const [errors, setErrors] = useState({});

  // Modal states
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedContentName, setUploadedContentName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isNavigatingRef = useRef(false);

  const hasFormData = () => {
    const hasTextData =
      formData.nombre.trim() !== "" ||
      formData.descripcion.trim() !== "" ||
      formData.tipo !== "Articulo";
    const hasFiles = selectedFile !== null || selectedThumbnail !== null;
    const hasRoles = selectedRoles.length > 0;
    return hasTextData || hasFiles || hasRoles;
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasFormData() && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, selectedFile, selectedThumbnail, selectedRoles]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleInputChange = (e) => {
    handleContentInputChange(e, setFormData, setErrors);
  };

  const handleFileChange = (e, type = "content") => {
    const error = handleContentFileChange(
      e,
      type,
      type === "thumbnail" ? setSelectedThumbnail : setSelectedFile,
      setErrors
    );

    if (error) {
      setErrorMessage(error);
      setErrorModalOpen(true);
    }
  };

  const handleRoleToggle = (roleId) => {
    handleContentRoleToggle(roleId, selectedRoles, setSelectedRoles, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const formErrors = validateContentForm({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      roles: selectedRoles,
      file: selectedFile,
      thumbnail: selectedThumbnail,
    });

    setErrors(formErrors);

    if (hasContentErrors(formErrors)) {
      const firstError = Object.values(formErrors).find((err) => err !== null);
      setErrorMessage(
        firstError || "Por favor corrige los errores antes de continuar"
      );
      setErrorModalOpen(true);
      return;
    }

    try {
      setUploading(true);
      const token = await getToken();

      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("nombre", formData.nombre.trim());
      uploadData.append("descripcion", formData.descripcion.trim());
      uploadData.append("tipo", formData.tipo);
      uploadData.append("roles", JSON.stringify(selectedRoles));

      if (selectedThumbnail) {
        uploadData.append("thumbnail", selectedThumbnail);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/content/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData,
        }
      );

      const result = await response.json();

      if (result.success) {
        isNavigatingRef.current = true;
        setUploadedContentName(formData.nombre);

        setFormData({
          nombre: "",
          descripcion: "",
          tipo: "Articulo",
        });
        setSelectedFile(null);
        setSelectedThumbnail(null);
        setSelectedRoles([]);
        setErrors({});

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

  const handleConfirmExit = () => {
    isNavigatingRef.current = true;
    setShowConfirmModal(false);
    setFormData({ nombre: "", descripcion: "", tipo: "Articulo" });
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setSelectedRoles([]);
    navigate(-1);
  };

  const handleCancelExit = () => {
    setShowConfirmModal(false);
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
      <AppHeader user={user} showSearch={false} />
      <Sidebar current={current} onNavigate={setCurrent} />

      <main className="p-4 md:ml-[var(--sb-w,80px)] transition-[margin] duration-300 ease-in-out pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <BackButton
              onClick={() => {
                if (hasFormData()) {
                  setShowConfirmModal(true);
                } else {
                  isNavigatingRef.current = true;
                  navigate(-1);
                }
              }}
            />
            <Title2 className="mb-0">Subir nuevo contenido multimedia</Title2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <FormField
                label="Nombre del archivo"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej. Introducción a la Fisioterapia Pélvica"
                maxLength={CONTENT_FIELD_MAX_LENGTHS.nombre}
                required
                error={errors.nombre}
              />

              <FormField
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Escribe una breve descripción del contenido"
                maxLength={CONTENT_FIELD_MAX_LENGTHS.descripcion}
                multiline
                rows={6}
                error={errors.descripcion}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Dropdown
                    name="tipo"
                    label="Tipo de contenido"
                    required={true}
                    value={formData.tipo}
                    onChange={handleInputChange}
                    options={CONTENT_TYPE_OPTIONS}
                    placeholder="Selecciona un tipo"
                    error={errors.tipo}
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4">
                    Dirigido a <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-2 border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {roles.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Cargando roles...
                      </p>
                    ) : (
                      roles.map((role) => (
                        <label
                          key={role.IDRol || role.id}
                          className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(
                              role.IDRol || role.id
                            )}
                            onChange={() =>
                              handleRoleToggle(role.IDRol || role.id)
                            }
                            className="checkbox-brand"
                          />
                          <span className="text-sm text-slate-700">
                            {role.nombre || role.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  {errors.roles && (
                    <p className="text-sm text-red-500 mt-2">{errors.roles}</p>
                  )}
                  {selectedRoles.length > 0 && !errors.roles && (
                    <p className="text-xs text-slate-500 mt-2">
                      {selectedRoles.length}{" "}
                      {selectedRoles.length === 1
                        ? "rol seleccionado"
                        : "roles seleccionados"}
                    </p>
                  )}
                </div>
              </div>

              {/* File upload sections */}
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
                    accept={ACCEPTED_CONTENT_TYPES}
                    required
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          document.getElementById("file-upload").value = "";
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                {errors.file && (
                  <p className="text-sm text-red-500 mt-2">{errors.file}</p>
                )}
              </div>

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
                    accept={ACCEPTED_THUMBNAIL_TYPES}
                  />

                  {selectedThumbnail ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedThumbnail.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedThumbnail.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedThumbnail(null);
                          document.getElementById("thumbnail-upload").value =
                            "";
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                {errors.thumbnail && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.thumbnail}
                  </p>
                )}
              </div>

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
                    setErrors({});
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

      <SuccessErrorModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        type="success"
        title="¡Contenido subido exitosamente!"
        message={`El contenido "${uploadedContentName}" ha sido subido correctamente y estará disponible para los usuarios.`}
        confirmLabel="Entendido"
      />

      <SuccessErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        type="error"
        title="Error al subir contenido"
        message={errorMessage}
        confirmLabel="Cerrar"
      />

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
