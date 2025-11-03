/**
 * @fileoverview Documents card component for displaying user documents.
 * Provides preview and download functionality for PDFs.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FileUpload from '../molecules/fileUpload';
import { updateUserDocuments, getUserProfileById } from '../controllers/profile.controller';

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

  async function handleSave() {
    if (!onSave || !userId) {
      console.error('onSave or userId is required');
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
      const refreshedProfile = await getUserProfileById(userId, token);
      
      // Call onSave with updated data to refresh parent component
      await onSave(refreshedProfile);
      
      setIsEditing(false);
      setFormFiles({
        titulo: null,
        cedula: null,
        constancias: null
      });
    } catch (error) {
      console.error('Error saving documents:', error);
      alert('Error al guardar documentos: ' + (error.message || 'Error desconocido'));
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
   * @return {!JSX.Element} Document row.
   */
  const DocumentRow = ({label, fileUrl, filename, fieldName}) => {
    if (isEditing) {
      return (
        <div className="py-2 border-b border-slate-100 last:border-0">
          <FileUpload
            name={fieldName}
            label={label}
            value={formFiles[fieldName]}
            onChange={handleFileChange}
            accept=".pdf"
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
            className="text-slate-600 hover:text-slate-900"
            aria-label={isEditing ? 'Cancelar edición' : 'Editar documentación'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0L6.5 10.672V14h3.328l8.086-8.086a2 2 0 0 0 0-2.828z" />
              <path d="M4 16h12v2H4a2 2 0 0 1-2-2V4h2v12z" />
            </svg>
          </button>
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
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
              // Restore original values
              setFormFiles({
                titulo: null,
                cedula: null,
                constancias: null
              });
            }}
            className="px-3 py-1 border rounded"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={isUploading}
            className="px-3 py-1 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{background:'#CAD00F'}}
          >
            {isUploading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </section>
  );
}

