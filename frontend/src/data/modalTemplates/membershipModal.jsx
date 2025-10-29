/** 
 * @fileoverview Modal for viewing membership application requests with attached documents.
 * @author EXACTUM-dev
 * @version 1.2.2
 */

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import Button from "../../atoms/button";
import { Title2 } from "../../atoms/typography";
import FieldBox from "../../molecules/form";
import DataTable from "../../organisms/dataTable";
import Modal from "../../molecules/modal";
import ConfirmationModal from "../../molecules/confirmationModal";
import RejectModal from "../../data/modalTemplates/rejectMembershipModal";
import pdfIcon from "../../assets/icons/pdf.png";
import { useAuth } from '@clerk/clerk-react';
import { fetchWithClerk } from '../../utils/api';

/** 
 * Configure the PDF.js worker to handle PDF rendering in a separate thread.
 * The worker file path is resolved dynamically to avoid bundling issues.
 */
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
 * @returns {JSX.Element} The modal content for viewing a membership request.
 */
function MembershipModalContent({
  open,
  title = "Solicitud de",
  tableData: tableDataProp = [],
  solicitud = {
    nombre: "Juan Pérez",
    correo: "juan@example.com",
    telefono: "5551234567",
    facebook: "juan.p",
    instagram: "juanp",
    linkedin: "juan-perez",
    paginaWeb: "https://juanperez.com",
    ubicacion: "Ciudad de México",
    licenciatura: "Ingeniería en Sistemas",
    documentos: [
      { id: 1, label: "Solicitud de membresía", url: "/doc1.pdf", checked: false },
      { id: 2, label: "Identificación oficial", url: "/doc2.pdf", checked: true },
      { id: 3, label: "Carta de recomendación", url: "/doc3.pdf", checked: false },
      { id: 4, label: "Comprobante de domicilio", url: "/doc4.pdf", checked: true },
    ],
  },
  onClose,
}) {
  // State variables for managing modal visibility
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

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
    correo,
    telefono,
    facebook,
    instagram,
    linkedin,
    paginaWeb,
    ubicacion,
    licenciatura,
    documentos = [],
  } = solicitud;

  const { getToken } = useAuth();

  // Handle confirm acceptance and call backend to approve membership
  const handleConfirmApprove = async () => {
    setShowConfirmModal(false);
    try {
      const token = await getToken();
      const id = solicitud?.IDMembresia || solicitud?.id || solicitud?.ID || solicitud?.IDMembresia;
      if (!id) throw new Error('ID de solicitud no disponible');
      await fetchWithClerk(`/api/membresias/${id}/aprobar`, { method: 'POST' }, token);
      // Show accepted modal to inform admin the positive status for the application
      setShowAcceptedModal(true);
    } catch (err) {
      console.error('Error aprobando solicitud:', err);
      window.alert('No se pudo aprobar la solicitud. Revise la consola para más detalles.');
    }
  };

  //Determine which data to use for the table: custom or from `solicitud`.
  const tableData = tableDataProp.length > 0 ? tableDataProp : documentos;

  // Automatically focuses on the first input when the modal opens.
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
            <p className="text-lg font-semibold text-center mb-4">{nombre}</p>

            {/* Applicant contact and social info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldBox label="Correo" value={correo || "No se envió"} readOnly onChange={setData} />
              <FieldBox label="Teléfono" value={telefono || "No se envió"} readOnly onChange={setData} />
              <FieldBox label="Facebook" value={facebook || "No se envió"} readOnly onChange={setData} />
              <FieldBox label="Instagram" value={instagram || "No se envió"} readOnly onChange={setData} />
              <FieldBox label="LinkedIn" value={linkedin || "No se envió"} readOnly onChange={setData} />
              <FieldBox label="Página web" value={paginaWeb || "No se envió"} readOnly onChange={setData} />
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
              <FieldBox label="Licenciatura" value={licenciatura || "No se envió"} readOnly onChange={setData} />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-slate-200 mx-2" />

          {/* Right column - Document list */}
          <div className="flex-1 min-w-0 mt-4 lg:mt-0 min-h-0">
            <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3">
              <DataTable
                columns={[
                  {
                    key: "tipoDocumentos",
                    label: "Tipo de documento",
                    headAlign: "left",
                    align: "left",
                    render: (row) => (
                      <span className="text-sm sm:text-base break-words">{row.label}</span>
                    ),
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
                        {row.url ? null : (
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
          <Button label="Rechazar" variant="cancel" onClick={() => setShowRejectModal(true)} />
          <Button label="Aceptar" variant="brand" onClick={() => setShowConfirmModal(true)} />
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
          <Button label="Cerrar" variant="cancel" onClick={closePdfModal} className="mt-4" />
        </div>
      </Modal>

      {/* Confirmation modal */}
      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} size="md">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Última confirmación</h2>
          <p className="text-slate-700 mb-6 leading-relaxed">
            Al darle Confirmar, se aceptará a <strong>{`${nombre || solicitud.nombre || ''}`}</strong> y podrá acceder a todos los beneficios de la membresía <strong>{solicitud?.tipo || solicitud?.membershipType || ''}</strong>.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              label="Cancelar"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              radius="xl"
              className="min-w-[140px] border-2 border-[#d6d900] text-[#8a7e00] hover:bg-yellow-50"
            />
            <Button
              label="Confirmar"
              variant="brand"
              onClick={handleConfirmApprove}
              radius="xl"
              className="min-w-[140px] bg-[#d6d900] hover:bg-[#c6c600] text-black font-semibold"
            />
          </div>
        </div>
      </Modal>

      <RejectModal
        open={showRejectModal}
        onConfirm={() => setShowRejectModal(false)}
        onCancel={() => setShowRejectModal(false)}
      />

      {/* Accepted confirmation modal shown after successful approve */}
      <Modal open={showAcceptedModal} onClose={() => { setShowAcceptedModal(false); if (typeof onClose === 'function') onClose(); }} size="md">
        <div className="flex flex-col items-center p-6">
          {/* green check */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="1.5" fill="white" />
              <path d="M7 12l3 3 7-7" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-center">El miembro {nombre || solicitud.nombre || ''} ha sido aceptado en la sociedad</h3>
          <div>
            <Button label="Entendido" variant="brand" onClick={() => { setShowAcceptedModal(false); if (typeof onClose === 'function') onClose(); }} className="px-8 py-3 bg-[#d6d900] text-black font-semibold" />
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Wrapper component for conditional rendering of the membership modal.
 * Prevents unnecessary DOM rendering when the modal is not open.
 * @param {Object} props - MembershipModalContent props.
 * @returns {JSX.Element|null} Returns null if modal is not open.
 */
export default function MembershipModal(props) {
  if (!props.open) return null;
  return <MembershipModalContent {...props} />;
}
