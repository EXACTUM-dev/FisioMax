/**
 * @fileoverview Documents card component for displaying user documents.
 * Provides preview and download functionality for PDFs.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FileUpload from '../molecules/fileUpload';
import { updateUserDocuments, getUserProfileById, getCurrentUserProfile } from '../controllers/profile.controller';
import editIcon from "../assets/icons/square-pen.png";
import Button from "../atoms/button";
import SuccessErrorModal from './successErrorModal';
import Modal from '../molecules/modal';

/**
 * Displays user documents with preview and download options.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing document URLs.
 * @param {boolean} props.canEdit - Whether editing is allowed.
 * @param {Function} props.onSave - Callback function to save document changes and reload profile.
 * @param {string} props.userId - User ID for updating documents (required if canEdit is true).
 * @return {!JSX.Element} Documents card component.
 */
export default function DocumentsCard({data = {}, canEdit = false, onSave, userId}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formFiles, setFormFiles] = useState({
    titulo: null,
    cedula: null,
    constancias: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const { getToken } = useAuth();

  const hasFile = (v) => !!v;

  // Reset form when data changes
  useEffect(() => {
    setFormFiles({
      titulo: null,
      cedula: null,
      constancias: null
    });
  }, [data]);

  /**
   * Opens document in a new tab for preview.
   * @param {string} url - Document URL.
   * @return {void}
   */
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
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
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error descargando documento:', error);
      // Fallback: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  function handleFileChange(e) {
    const { name, files } = e.target;
    const file = files[0] || null;
    setFormFiles((prev) => ({ ...prev, [name]: file }));
  }

  /**
   * Validates that required documents are present
   * @returns {boolean} True if valid, false otherwise
   */
  const validateDocuments = () => {
    const missingFields = [];
    
    // Check if titulo exists (either in form or already in data)
    if (!formFiles.titulo && !data.titulo) {
      missingFields.push('Título / Kardex');
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
      console.error('onSave or userId is required');
      return;
    }

    // Validate required documents
    if (!validateDocuments()) {
      return;
    }

    // Check if there are any files to upload
    const hasFiles = formFiles.titulo || formFiles.cedula || formFiles.constancias;
    if (!hasFiles) {
      setIsEditing(false);
      return;
    }

    setIsUploading(true);
    try {
      const token = await getToken();
      
      // Create FormData with files
      const formData = new FormData();
      if (formFiles.titulo) {
        formData.append('titulo', formFiles.titulo);
      }
      if (formFiles.cedula) {
        formData.append('cedula', formFiles.cedula);
      }
      if (formFiles.constancias) {
        formData.append('constancias', formFiles.constancias);
      }

      // Upload documents
      const updatedData = await updateUserDocuments(userId, formData, token);
      
      // Reload profile to get fresh presigned URLs
      // Use getCurrentUserProfile if userId matches current user, otherwise getUserProfileById
      const refreshedProfile = await getUserProfileById(userId, token);
      
      // Call onSave with updated data to refresh parent component
      await onSave(refreshedProfile);
      
      setIsEditing(false);
      setFormFiles({
        titulo: null,
        cedula: null,
        constancias: null
      });
      
      // Show success modal
      setModalType('success');
      setModalMessage('Los documentos se han actualizado exitosamente.');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving documents:', error);
      // Show error modal
      setModalType('error');
      setModalMessage(error.message || 'Error desconocido al guardar los documentos. Por favor, intente nuevamente.');
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
  const DocumentRow = ({label, fileUrl, filename, fieldName, required = false}) => {
    if (isEditing) {
      return (
        <div className="py-2 border-b border-slate-100 last:border-0">
          <FileUpload
            name={fieldName}
            label={label}
            value={formFiles[fieldName]}
            onChange={handleFileChange}
            accept=".pdf"
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
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              title="Ver documento"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => handleDownloadDocument(fileUrl, filename)}
              className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
              title="Descargar documento"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50"
            aria-label={isEditing ? 'Cancelar edición' : 'Editar documentación'}
          >
            <img
              src={editIcon}
              alt="Editar"
              className="w-5 h-5 object-contain opacity-80"
            />
          </button>
        )}
      </div>

      <div className={isEditing ? "space-y-4" : "space-y-1 text-sm"}>
        <DocumentRow 
          label="Título / Kardex" 
          fileUrl={data.titulo} 
          filename="titulo.pdf"
          fieldName="titulo"
          required={true}
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
        
        {/* Additional documents - only show in view mode for now */}
        {!isEditing && data.documentosAdicionales && data.documentosAdicionales.length > 0 && (
          <>
            {data.documentosAdicionales.map((doc, index) => (
              <DocumentRow 
                key={index}
                label={`Documento adicional ${index + 1}`} 
                fileUrl={doc} 
                filename={`documento_adicional_${index + 1}.pdf`}
                fieldName={`extraDoc${index}`}
              />
            ))}
          </>
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
                constancias: null
              });
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
            {isUploading ? 'Guardando...' : 'Guardar'}
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
    </section>
  );
}

