/**
 * @fileoverview Documents card component for displaying user documents.
 * Provides preview and download functionality for PDFs and images (JPG, JPEG, PNG).
 * @version 1.2.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import FileUpload from "../molecules/fileUpload";
import {
  updateUserDocuments,
  getUserProfileById,
  getCurrentUserProfile,
} from "../controllers/profile.controller";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import SuccessErrorModal from "./successErrorModal";
import Modal from "../molecules/modal";
import pdfIcon from "../assets/icons/pdf.png";

/**
 * Displays user documents with preview and download options.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing document URLs.
 * @param {boolean} props.canEdit - Whether editing is allowed.
 * @param {Function} props.onSave - Callback function to save document changes and reload profile.
 * @param {string} props.userId - User ID for updating documents (required if canEdit is true).
 * @return {!JSX.Element} Documents card component.
 */
export default function DocumentsCard({
  data = {},
  canEdit = false,
  onSave,
  userId,
  onEditChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const MAX_EXTRA_DOCS = 10;

  // Notify parent component when editing state changes
  useEffect(() => {
    if (onEditChange) {
      onEditChange(isEditing);
    }
  }, [isEditing, onEditChange]);

  const [formFiles, setFormFiles] = useState({
    titulo: null,
    cedula: null,
    constancias: null,
  });
  const [extraDocs, setExtraDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const { getToken } = useAuth();

  const hasFile = (v) => !!v;

  // Debug: Log data to see what we're receiving
  useEffect(() => { }, [data]);

  // Reset form when data changes
  useEffect(() => {
    setFormFiles({
      titulo: null,
      cedula: null,
      constancias: null,
    });
    setExtraDocs([]);
  }, [data]);

  /**
   * Opens document in a new tab for preview.
   * @param {string} url - Document URL.
   * @return {void}
   */
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  /**
   * Downloads the document by fetching and creating a blob.
   * @param {string} url - Document URL.
   * @param {string} filename - Suggested filename for download.
   * @return {!Promise<void>}
   */
  const handleDownloadDocument = async (url, filename) => {
    if (!url) return;

    try {
      // Fetch the file as a blob
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setError("Error al descargar el documento. Por favor intente más tarde.");
      // Fallback: open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  function handleFileChange(e) {
    const { name, files } = e.target;
    const file = files[0] || null;
    setFormFiles((prev) => ({ ...prev, [name]: file }));
  }

  const handleAddDocuments = () => {
    if (extraDocs.length < MAX_EXTRA_DOCS) {
      setExtraDocs((prev) => [...prev, { id: Date.now(), file: null }]);
    }
  };

  const handleExtraFileChange = (id, e) => {
    const file = e.target.files[0] || null;
    setExtraDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file } : doc))
    );
  };

  /**
   * Validates that required documents are present
   * @returns {boolean} True if valid, false otherwise
   */
  const validateDocuments = () => {
    const missingFields = [];

    // Check if titulo exists (either in form or already in data)
    if (!formFiles.titulo && !data.titulo) {
      missingFields.push("Título / Kardex");
    }

    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }

    return true;
  };

  async function handleSave() {
    if (!onSave || !userId) {
      setError("onSave or userId is required");
      return;
    }

    // Check if there are any actual File objects to upload
    const hasFiles =
      (formFiles.titulo && formFiles.titulo instanceof File) ||
      (formFiles.cedula && formFiles.cedula instanceof File) ||
      (formFiles.constancias && formFiles.constancias instanceof File) ||
      extraDocs.some((doc) => doc.file && doc.file instanceof File);

    if (!hasFiles) {
      // No files selected, just close edit mode
      setIsEditing(false);
      return;
    }

    // Validate required documents only if user is uploading for the first time
    // (i.e., if they don't have a titulo already and aren't uploading one now)
    if (!data.titulo && !formFiles.titulo) {
      setValidationErrors(["Título / Kardex"]);
      setShowValidationModal(true);
      return;
    }

    setIsUploading(true);
    try {
      const token = await getToken();

      // Create FormData with files
      const formData = new FormData();
      let fileCount = 0;

      if (formFiles.titulo && formFiles.titulo instanceof File) {
        formData.append("titulo", formFiles.titulo);
        fileCount++;
      }
      if (formFiles.cedula && formFiles.cedula instanceof File) {
        formData.append("cedula", formFiles.cedula);
        fileCount++;
      }
      if (formFiles.constancias && formFiles.constancias instanceof File) {
        formData.append("constancias", formFiles.constancias);
        fileCount++;
      }

      // Add extra documents - only if they have actual file objects
      extraDocs.forEach((doc, index) => {
        if (doc.file && doc.file instanceof File) {
          formData.append(`extraDoc${index + 1}`, doc.file);
          fileCount++;
        }
      });

      // Double check that we actually have files to upload
      if (fileCount === 0) {
        setIsEditing(false);
        setIsUploading(false);
        return;
      }

      // Upload documents
      const updatedData = await updateUserDocuments(userId, formData, token);

      // Reload profile to get fresh presigned URLs
      const refreshedProfile = await getUserProfileById(userId, token);

      // Call onSave with updated data to refresh parent component
      await onSave(refreshedProfile);

      setIsEditing(false);
      setFormFiles({
        titulo: null,
        cedula: null,
        constancias: null,
      });
      setExtraDocs([]);

      // Show success modal
      setModalType("success");
      setModalMessage("Los documentos se han actualizado exitosamente.");
      setShowModal(true);
    } catch (error) {
      setError("Error al guardar los documentos. Por favor intente más tarde.");
      // Show error modal
      setModalType("error");
      setModalMessage(
        error.message ||
        "Error desconocido al guardar los documentos. Por favor, intente nuevamente."
      );
      setShowModal(true);
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Renders document row with action buttons or file upload.
   * @param {!Object} props - Component props.
   * @param {string} props.label - Document label.
   * @param {string} props.fileUrl - Document URL.
   * @param {string} props.filename - Suggested filename.
   * @param {string} props.fieldName - Field name for form.
   * @param {boolean} props.required - Whether the document is required.
   * @return {!JSX.Element} Document row.
   */
  const DocumentRow = ({
    label,
    fileUrl,
    filename,
    fieldName,
    required = false,
  }) => {
    if (isEditing) {
      return (
        <div className="py-2 border-b border-slate-100 last:border-0">
          <FileUpload
            name={fieldName}
            label={label}
            value={formFiles[fieldName]}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            limitation="PDF, JPG, JPEG o PNG hasta 20MB"
            required={required}
          />
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
        <span className="text-slate-600">{label}</span>
        {hasFile(fileUrl) ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium">Cargado</span>
            <button
              onClick={() => handleViewDocument(fileUrl)}
              className="text-blue-600 hover:text-blue-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
              title="Ver documento"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDownloadDocument(fileUrl, filename)}
              className="text-slate-600 hover:text-slate-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
              title="Descargar documento"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">No cargado</span>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Documentación</h3>
        {canEdit && (
          <EditButton
            isEditing={isEditing}
            onClick={() => setIsEditing((v) => !v)}
            editLabel="Editar"
            cancelLabel="Cancelar"
          />
        )}
      </div>

      <div className={isEditing ? "space-y-4" : "space-y-1 text-sm"}>
        <DocumentRow
          label="Título / Kardex"
          fileUrl={data.titulo}
          filename="titulo.pdf"
          fieldName="titulo"
        />
        <DocumentRow
          label="Cédula profesional"
          fileUrl={data.cedula}
          filename="cedula.pdf"
          fieldName="cedula"
        />
        <DocumentRow
          label="Constancias pélvicas"
          fileUrl={data.constancias}
          filename="constancias.pdf"
          fieldName="constancias"
        />

        {/* Additional documents - show in both view and edit modes */}
        {!isEditing &&
          data.documentosadicionales &&
          data.documentosadicionales.length > 0 && (
            <>
              {data.documentosadicionales.map((doc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-600">{`Documento adicional ${index + 1
                    }`}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium">
                      Cargado
                    </span>
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="text-blue-600 hover:text-blue-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
                      title="Ver documento"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadDocument(
                          doc,
                          `documento_adicional_${index + 1}.pdf`
                        )
                      }
                      className="text-slate-600 hover:text-slate-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
                      title="Descargar documento"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

        {/* Extra documents in edit mode */}
        {isEditing &&
          extraDocs.map((doc, i) => (
            <div
              key={doc.id}
              className="relative py-2 border-b border-slate-100"
            >
              <FileUpload
                name={`extra-${doc.id}`}
                label={`Documento adicional ${i + 1}`}
                value={doc.file}
                onChange={(e) => handleExtraFileChange(doc.id, e)}
                accept=".pdf,.jpg,.jpeg,.png"
                limitation="PDF, JPG, JPEG o PNG hasta 20MB"
              />
              <button
                type="button"
                onClick={() =>
                  setExtraDocs((prev) => prev.filter((d) => d.id !== doc.id))
                }
                className="absolute top-2 right-0 text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}

        {isEditing && (
          <Button
            variant="newDoc"
            size="sm"
            onClick={handleAddDocuments}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 mt-2"
            type="button"
            disabled={extraDocs.length >= MAX_EXTRA_DOCS}
          >
            Agregar documentos adicionales
          </Button>
        )}
        {isEditing && extraDocs.length >= MAX_EXTRA_DOCS && (
          <p className="text-xs text-red-500 mt-2">
            Solo puedes agregar hasta 10 documentos adicionales.
          </p>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              // Restore original values
              setFormFiles({
                titulo: null,
                cedula: null,
                constancias: null,
              });
              setExtraDocs([]);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={handleSave}
            disabled={isUploading}
          >
            {isUploading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      )}

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
      <Modal
        open={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        size="md"
        position="center"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            <svg
              className="h-16 w-16 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Campos requeridos faltantes
          </h3>
          <p className="text-gray-600 mb-6">
            Por favor completa los siguientes campos obligatorios antes de
            guardar:
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
          <Button
            variant="brand"
            onClick={() => setShowValidationModal(false)}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      </Modal>
    </section>
  );
}
