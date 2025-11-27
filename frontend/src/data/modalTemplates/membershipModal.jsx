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
import { useAuth } from "@clerk/clerk-react";
import { fetchWithClerk } from "../../utils/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function MembershipModalContent({
  open,
  title = "Solicitud de",
  tableData: tableDataProp = [],
  solicitud = {},
  onClose,
  onStatusChange,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [noAfiliado, setNoAfiliado] = useState("");
  const [maxNoAfiliado, setMaxNoAfiliado] = useState(0);

  const { getToken } = useAuth();

  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      // Focus the first element
      first?.focus();

      // Function to catch the navigation with Tab
      const handleKeyDown = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      modalRef.current.addEventListener("keydown", handleKeyDown);
      return () =>
        modalRef.current?.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      modalRef.current.addEventListener("keydown", handleKeyDown);
      return () =>
        modalRef.current?.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  useEffect(() => {
    const fetchMaxNoAfiliado = async () => {
      if (open) {
        try {
          const token = await getToken();
          const response = await fetchWithClerk(
            "/api/membership-applications/max-no-afiliado",
            { method: "GET" },
            token
          );
          if (response?.success) {
            const nextVal = (parseInt(response.data, 10) || 0) + 1;
            setMaxNoAfiliado(response.data);
            setNoAfiliado(nextVal.toString());
          }
        } catch (error) {
        }
      }
    };
    fetchMaxNoAfiliado();
  }, [open, getToken]);

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl(null);
  };

  const downloadDocument = async (url, filename = "document.pdf") => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: abrir en nueva pestaña si la descarga falla
      window.open(url, "_blank", "noopener");
    }
  };

  const inputRef = useRef(null);

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

  const fechaNacimientoRaw =
    solicitud?.birthDate ||
    solicitud?.fechaNacimiento ||
    solicitud?.__raw?.birthDate ||
    solicitud?.__raw?.fechaNacimiento ||
    null;

  const formatDate = (d) => {
    if (!d) return null;
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return String(d);
    }
  };

  const fechaNacimiento = formatDate(fechaNacimientoRaw);

  const getMembershipId = () => {
    return (
      solicitud?.IDMembresia ||
      solicitud?.id ||
      solicitud?.ID ||
      solicitud?.__raw?.IDMembresia
    );
  };
  // Use canonical field names from the membership application flow
  const tipoMembresia = solicitud?.membershipType ?? null;
  const horasFormacion = solicitud?.membershipHoursFormation ?? null;

  const handleConfirmApprove = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      const token = await getToken();
      const id = getMembershipId();

      if (!id) {
        throw new Error("ID de solicitud no disponible");
      }

      const response = await fetchWithClerk(
        `/api/membership-applications/${id}/aprobar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ noAfiliado }),
        },
        token
      );

      if (response?.success) {
        if (typeof onStatusChange === "function") {
          onStatusChange(id, "Aprobado");
        }

        setShowAcceptedModal(true);
      } else {
        throw new Error(response?.message || "Error al aprobar solicitud");
      }
    } catch (err) {
      window.alert(`No se pudo aprobar la solicitud: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    setShowRejectModal(false);
    setIsProcessing(true);

    try {
      const token = await getToken();
      const id = getMembershipId();

      if (!id) {
        throw new Error("ID de solicitud no disponible");
      }
      const response = await fetchWithClerk(
        `/api/membership-applications/${id}/rechazar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razonRechazo: reason || "Sin razón especificada",
          }),
        },
        token
      );

      if (response?.success) {
        if (typeof onStatusChange === "function") {
          onStatusChange(id, "Rechazado");
        }

        setShowRejectedModal(true);
      } else {
        throw new Error(response?.message || "Error al rechazar solicitud");
      }
    } catch (err) {
      window.alert(`No se pudo rechazar la solicitud: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const tableData = tableDataProp.length > 0 ? tableDataProp : documentos;

  const displayName = nombreCompleto || nombre || solicitud.nombre || "Usuario";

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus?.(), 100);
    }
  }, [open]);

  return (
    <>
      <Modal open={open} onClose={onClose} size="x2">
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-2 flex flex-col gap-2">
            <Title2 className="text-center mb-1">{title}</Title2>
            <p className="text-lg font-semibold text-center mb-4">
              {displayName}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FieldBox
                label="Correo"
                value={correo || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Teléfono"
                value={telefonoWhatsapp || telefono || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Fecha de Nacimiento"
                value={
                  fechaNacimiento
                    ? new Date(fechaNacimiento).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "No se envió"
                }
                readOnly
              />
              <FieldBox
                label="Facebook"
                value={facebook || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Instagram"
                value={instagram || "No se envió"}
                readOnly
              />
              <FieldBox
                label="LinkedIn"
                value={linkedin || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Página web"
                value={paginaWeb || "No se envió"}
                readOnly
              />
            </div>

            <div className="mt-1 flex flex-col gap-1">
              <FieldBox
                label="Ubicación de práctica profesional"
                value={ubicacion || "No se envió"}
                multiline
                rows={2}
                readOnly
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FieldBox
                label="Licenciatura"
                value={licenciatura || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Fecha de nacimiento"
                value={fechaNacimiento || "No se envió"}
                readOnly
              />
              <FieldBox
                label="Tipo de membresía"
                value={tipoMembresia || "No especificado"}
                readOnly
              />
              <FieldBox
                label="Horas de formación"
                value={horasFormacion ? `${horasFormacion} hrs` : "No se envió"}
                readOnly
              />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-slate-200 mx-2" />

          <div className="flex-2 min-w-0 lg:mt-0 min-h-0">
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
                        <button
                          type="button"
                          title={row.url ? "Ver documento" : "Sin archivo"}
                          onClick={() =>
                            row.url &&
                            window.open(
                              row.url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          disabled={!row.url}
                          className="text-blue-600 hover:text-blue-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          type="button"
                          title={row.url ? "Descargar PDF" : "Sin archivo"}
                          onClick={() =>
                            row.url && downloadDocument(row.url, row.key)
                          }
                          disabled={!row.url}
                          className="text-slate-600 hover:text-slate-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {!row.url && (
                          <span className="text-xs text-slate-400">
                            Sin archivo
                          </span>
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

        <div className="flex justify-end gap-3">
          <Button
            label="Rechazar"
            variant="outline"
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

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        size="sm"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            ¿Aceptar solicitud?
          </h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas aceptar a <strong>{displayName}</strong>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="mb-6 text-left">
            <FieldBox
              label="Número de Afiliado"
              value={noAfiliado}
              onChange={(e) => setNoAfiliado(e.target.value)}
              placeholder="Ingrese el número de afiliado"
              maxLength={6}
            />
          </div>
          <div className="flex justify-center gap-3">
            <Button
              label="Cancelar"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              radius="xl"
              disabled={isProcessing}
            />
            <Button
              label={isProcessing ? "Procesando..." : "Aceptar"}
              variant="brand"
              onClick={handleConfirmApprove}
              radius="xl"
              disabled={isProcessing}
            />
          </div>
        </div>
      </Modal>

      <RejectModal
        open={showRejectModal}
        onConfirm={handleConfirmReject}
        onCancel={() => setShowRejectModal(false)}
        title="Rechazar solicitud de membresía"
        subtitle={`Está a punto de rechazar la solicitud de ${displayName}. Por favor proporcione el motivo.`}
      />

      <Modal
        open={showAcceptedModal}
        onClose={() => {
          setShowAcceptedModal(false);
          if (typeof onClose === "function") onClose();
        }}
        size="md"
        className="p-6"
      >
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Title2 className="mb-4">¡Solicitud Aceptada!</Title2>
          <p className="text-lg">
            {displayName} ha sido aceptado en la sociedad.
          </p>
          <Button
            label="Entendido"
            variant="brand"
            onClick={() => {
              setShowAcceptedModal(false);
              if (typeof onClose === "function") onClose();
            }}
            className="mt-6"
          />
        </div>
      </Modal>

      <Modal
        open={showRejectedModal}
        onClose={() => {
          setShowRejectedModal(false);
          if (typeof onClose === "function") onClose();
        }}
        size="md"
        className="p-6"
      >
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Title2 className="mb-4">Solicitud Rechazada</Title2>
          <p className="text-lg">
            La solicitud de {displayName} ha sido rechazada.
          </p>
          <Button
            label="Entendido"
            variant="brand"
            onClick={() => {
              setShowRejectedModal(false);
              if (typeof onClose === "function") onClose();
            }}
            className="mt-6"
          />
        </div>
      </Modal>
    </>
  );
}

export default function MembershipModal(props) {
  if (!props.open) return null;
  return <MembershipModalContent {...props} />;
}
