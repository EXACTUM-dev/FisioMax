import React from 'react';

/**
 * DocumentsCard component - displays user documents with preview and download options
 * @param {Object} data - User profile data containing document URLs
 * @returns {JSX.Element} Documents card component
 */
export default function DocumentsCard({ data = {} }) {
  const hasFile = (v) => !!v;

  /**
   * Opens document in a new tab for preview
   * @param {string} url - Document URL
   */
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Downloads the document
   * @param {string} url - Document URL
   * @param {string} filename - Suggested filename for download
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

  /**
   * Renders document row with actions
   * @param {string} label - Document label
   * @param {string} fileUrl - Document URL
   * @param {string} filename - Suggested filename
   * @returns {JSX.Element} Document row
   */
  const DocumentRow = ({ label, fileUrl, filename }) => (
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

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Documentación</h3>
      </div>

      <div className="space-y-1 text-sm">
        <DocumentRow 
          label="Título / Kardex" 
          fileUrl={data.titulo} 
          filename="titulo.pdf" 
        />
        <DocumentRow 
          label="Cédula profesional" 
          fileUrl={data.cedula} 
          filename="cedula.pdf" 
        />
        <DocumentRow 
          label="Constancias pélvicas" 
          fileUrl={data.constancias} 
          filename="constancias.pdf" 
        />
        
        {/* Additional documents */}
        {data.documentosAdicionales && data.documentosAdicionales.length > 0 && (
          <>
            {data.documentosAdicionales.map((doc, index) => (
              <DocumentRow 
                key={index}
                label={`Documento adicional ${index + 1}`} 
                fileUrl={doc} 
                filename={`documento_adicional_${index + 1}.pdf`} 
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

