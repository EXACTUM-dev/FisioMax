/** 
 * @fileoverview Modal for viewing membership application requests with attached documents.
 * @author EXACTUM-dev
 * @version 1.3.1
 */

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import Button from "../../atoms/button";
import { Title2 } from "../../atoms/typography";
import FieldBox from "../../molecules/form";
import DataTable from "../../organisms/dataTable";
import Modal from "../../molecules/modal";
import RejectModal from "../../data/modalTemplates/rejectMembershipModal";
import pdfIcon from "../../assets/icons/pdf.png";
import { useAuth } from '@clerk/clerk-react';
import { fetchWithClerk } from '../../utils/api';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/**
 * MembershipModalContent component
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Determines whether the modal is visible.
 * @param {string} props.title - Title displayed on the modal header.
 * @param {Array} props.tableData - Optional custom data for the documents table.
 * @param {Object} props.solicitud - Contains applicant information and documents.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Function} props.onStatusChange - Callback when status changes (optional).
 * @returns {JSX.Element} The modal content for viewing a membership request.
 */
function MembershipModalContent({
  open,
  title = "Solicitud de",
  tableData: tableDataProp = [],
  solicitud = {},
  onClose,
  onStatusChange,
}) {
  // State variables for managing modal visibility
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getToken } = useAuth();

  // Opens the PDF preview modal with the selected document.
  const openPdfModal = (url) => {
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

  // Closes the PDF preview modal and clears the URL.
  const closePdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl(null);
  };

  // Download a file via fetch and trigger browser download.
  const downloadDocument = async (url, key) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const filename = key ? key.split('/').pop() : 'document.pdf';
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // release object URL after a short timeout
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000 * 10);
    } catch (err) {
      console.error('Error descargando documento:', err);
      // open in new tab
      window.open(url, '_blank', 'noopener');
    }
  };

  // Reference for focusing on a specific input when modal opens.
  const inputRef = useRef(null);

  // Destructure applicant data for easier access
  const {
    nombre,
    nombreCompleto,
    correo,
    telefono,
    telefonoWhatsapp,
    facebook,
    instagram,
    linkedin,
    paginaWeb,
    ubicacion,
    licenciatura,
    documentos = [],
  } = solicitud;

  // Get the membership ID from various possible fields
  const getMembershipId = () => {
    return solicitud?.IDMembresia || 
           solicitud?.id || 
           solicitud?.ID || 
           solicitud?.__raw?.IDMembresia;
  };

  // Handle confirm acceptance and call backend to approve membership
  const handleConfirmApprove = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    
    try {
      const token = await getToken();
      const id = getMembershipId();
      
      if (!id) {
        throw new Error('ID de solicitud no disponible');
      }

      const response = await fetchWithClerk(
        `/api/membership-applications/${id}/aprobar`, 
        { method: 'POST' }, 
        token
      );

      if (response?.success) {
        // Notify parent component of status change
        if (typeof onStatusChange === 'function') {
          onStatusChange(id, 'Aprobado');
        }
        
        // Show accepted modal
        setShowAcceptedModal(true);
      } else {
        throw new Error(response?.message || 'Error al aprobar solicitud');
      }
    } catch (err) {
      console.error('Error aprobando solicitud:', err);
      window.alert(`No se pudo aprobar la solicitud: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirm rejection with reason
  const handleConfirmReject = async (reason) => {
    setShowRejectModal(false);
    setIsProcessing(true);
    
    try {
      const token = await getToken();
      const id = getMembershipId();
      
      if (!id) {
        throw new Error('ID de solicitud no disponible');
      }

      // Send rejection reason in request body
      const response = await fetchWithClerk(
        `/api/membership-applications/${id}/rechazar`, 
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            razonRechazo: reason || 'Sin razón especificada' 
          })
        }, 
        token
      );

      if (response?.success) {
        // Notify parent component of status change
        if (typeof onStatusChange === 'function') {
          onStatusChange(id, 'Rechazado');
        }
        
        // Show rejected confirmation modal
        setShowRejectedModal(true);
      } else {
        throw new Error(response?.message || 'Error al rechazar solicitud');
      }
    } catch (err) {
      console.error('Error rechazando solicitud:', err);
      window.alert(`No se pudo rechazar la solicitud: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine which data to use for the table
  const tableData = tableDataProp.length > 0 ? tableDataProp : documentos;

  // Display full name 
  const displayName = nombreCompleto || nombre || solicitud.nombre || 'Usuario';

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus?.(), 100);
    }
  }, [open]);

  // Temporary function for handling field changes.
  const setData = (e) => {
    console.log(`Field ${e.target.name || "unnamed"} changed to:`, e.target.value);
  };

  return (
    <>
      {/* Main modal container */}
      <Modal open={open} onClose={onClose} size="x2">
        <div className="flex flex-col md:flex-row gap-6 w-full">
          
          {/* Left column - Applicant form */}
          <div className="flex-2 flex flex-col gap-2">
            <Title2 className="text-center mb-1">{title}</Title2>
            <p className="text-lg font-semibold text-center mb-4">{displayName}</p>

            {/* Applicant contact and social info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldBox 
                label="Correo" 
                value={correo || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
              <FieldBox 
                label="Teléfono" 
                value={telefonoWhatsapp || telefono || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
              <FieldBox 
                label="Facebook" 
                value={facebook || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
              <FieldBox 
                label="Instagram" 
                value={instagram || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
              <FieldBox 
                label="LinkedIn" 
                value={linkedin || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
              <FieldBox 
                label="Página web" 
                value={paginaWeb || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
            </div>

            {/* Academic and location info */}
            <div className="mt-1 flex flex-col gap-1">
              <FieldBox
                label="Ubicación de práctica profesional"
                value={ubicacion || "No se envió"}
                multiline
                rows={2}
                readOnly
                onChange={setData}
              />
              <FieldBox 
                label="Licenciatura" 
                value={licenciatura || "No se envió"} 
                readOnly 
                onChange={setData} 
              />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-slate-200 mx-2" />

          {/* Right column - Document list */}
          <div className="flex-2 min-w-0 mt-4 lg:mt-0 min-h-0">
            <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3">
              <DataTable
                columns={[
                  {
                    key: "tipoDocumentos",
                    label: "Tipo de documento",
                    headAlign: "left",
                    align: "left",
                    render: (row) => (
                      <span className="text-sm sm:text-base break-words">
                        {row.label}
                      </span>
                    ),
                  },
                  {
                    key: "horasDocumentos",
                    label: "",
                    headAlign: "right",
                    align: "right",
                    render: (row) =>
                      row.hours ? (
                        <span className="text-sm sm:text-base break-words">
                          {row.hours} hrs
                        </span>
                      ) : null,
                  },
                  {
                    key: "verDocumentos",
                    label: "Documento",
                    className: "max-w-[20%] text-right",
                    isAction: true,
                    render: (row) => (
                      <div className="flex items-center justify-end gap-2">
                        {/* View PDF in modal (preview) */}
                        <button
                          type="button"
                          title={row.url ? "Descargar PDF" : "Sin archivo"}
                          onClick={() => row.url && downloadDocument(row.url, row.key)}
                          disabled={!row.url}
                          className={
                            "px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 " +
                            (row.url
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md hover:scale-105"
                              : "bg-slate-50 text-slate-300 cursor-not-allowed") +
                            " shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-1 active:scale-95"
                          }
                        >
                          <img
                            src={pdfIcon}
                            alt={row.url ? "Descargar PDF" : "Sin archivo"}
                            className="w-5 h-5 object-contain opacity-80 hover:opacity-100 transition-opacity"
                          />
                        </button>
                        {/* Download / open in new tab — use signed URL if available */}
                        {!row.url && (
                          <span className="text-xs text-slate-400">Sin archivo</span>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={tableData.map((item, index) => ({
                  ...item,
                  sequenceNumber: index + 1,
                }))}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            label="Rechazar" 
            variant="cancel" 
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
          />
          <Button 
            label="Aceptar" 
            variant="brand" 
            onClick={() => setShowConfirmModal(true)}
            disabled={isProcessing}
          />
        </div>
      </Modal>

      {/* PDF preview modal */}
      <Modal open={pdfModalOpen} onClose={closePdfModal} size="2xl">
        <div className="flex flex-col items-center p-4">
          <h3 className="text-lg font-semibold mb-4">Vista previa del PDF</h3>
          {pdfUrl && (
            <Document file={pdfUrl}>
              <Page pageNumber={1} width={600} />
            </Document>
          )}
          <Button 
            label="Cerrar" 
            variant="cancel" 
            onClick={closePdfModal} 
            className="mt-4" 
          />
        </div>
      </Modal>

      {/* Confirmation modal for APPROVAL */}
      <Modal 
        open={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        size="md"
      >
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Última confirmación
          </h2>
          <p className="text-slate-700 mb-6 leading-relaxed">
            Al darle Confirmar, se aceptará a <strong>{displayName}</strong> y 
            podrá acceder a todos los beneficios de la membresía{' '}
            <strong>{solicitud?.tipo || 'estándar'}</strong>.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              label="Cancelar"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              radius="xl"
              className="min-w-[140px] border-2 border-[#d6d900] text-[#8a7e00] hover:bg-yellow-50"
              disabled={isProcessing}
            />
            <Button
              label={isProcessing ? "Procesando..." : "Confirmar"}
              variant="brand"
              onClick={handleConfirmApprove}
              radius="xl"
              className="min-w-[140px] bg-[#d6d900] hover:bg-[#c6c600] text-black font-semibold"
              disabled={isProcessing}
            />
          </div>
        </div>
      </Modal>

      {/* Reject confirmation modal with reason */}
      <RejectModal
        open={showRejectModal}
        onConfirm={handleConfirmReject}
        onCancel={() => setShowRejectModal(false)}
        title="Rechazar solicitud de membresía"
        subtitle={`Está a punto de rechazar la solicitud de ${displayName}. Por favor proporcione el motivo.`}
      />

      {/* Accepted confirmation modal shown after successful approve */}
      <Modal 
        open={showAcceptedModal} 
        onClose={() => { 
          setShowAcceptedModal(false); 
          if (typeof onClose === 'function') onClose(); 
        }} 
        size="md"
      >
        <div className="flex flex-col items-center p-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-12 h-12 text-green-600" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="#16a34a" 
                strokeWidth="1.5" 
                fill="white" 
              />
              <path 
                d="M7 12l3 3 7-7" 
                stroke="#16a34a" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-center">
            El miembro {displayName} ha sido aceptado en la sociedad
          </h3>
          <div>
            <Button 
              label="Entendido" 
              variant="brand" 
              onClick={() => { 
                setShowAcceptedModal(false); 
                if (typeof onClose === 'function') onClose(); 
              }} 
              className="px-8 py-3 bg-[#d6d900] text-black font-semibold" 
            />
          </div>
        </div>
      </Modal>

      {/* Rejected confirmation modal */}
      <Modal 
        open={showRejectedModal} 
        onClose={() => { 
          setShowRejectedModal(false); 
          if (typeof onClose === 'function') onClose(); 
        }} 
        size="md"
      >
        <div className="flex flex-col items-center p-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-12 h-12 text-red-600" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="#dc2626" 
                strokeWidth="1.5" 
                fill="white" 
              />
              <path 
                d="M8 8l8 8M16 8l-8 8" 
                stroke="#dc2626" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-center text-slate-900">
            La solicitud de {displayName} ha sido rechazada
          </h3>
          <p className="text-slate-600 mb-6 text-center">
            El aplicante ha sido notificado de la decisión.
          </p>
          <div>
            <Button 
              label="Entendido" 
              variant="brand" 
              onClick={() => { 
                setShowRejectedModal(false); 
                if (typeof onClose === 'function') onClose(); 
              }} 
              className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold" 
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Wrapper component for conditional rendering of the membership modal.
 */
export default function MembershipModal(props) {
  if (!props.open) return null;
  return <MembershipModalContent {...props} />;
}