/**
 * @fileoverview React component for displaying a user's membership certificate.
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Displays a membership certificate for a user, with options to view,
 * download, or regenerate (admin only) the certificate.
 */

import React from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  getMembershipCertificate,
  regenerateMembershipCertificate,
} from "../services/contentServices";

/**
 * CertificateCard
 * @param {string} userId - User ID whose certificate to fetch
 * @param {boolean} isAdmin - Whether the current user is an admin (shows regenerate button)
 * - Shows membership certificate thumbnail (or embedded PDF)
 * - Buttons: Ver (abre en nueva pestaña), Descargar, y Regenerar (solo admin)
 */

export default function CertificateCard({ userId, isAdmin = false }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [certificateUrl, setCertificateUrl] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [regenerating, setRegenerating] = React.useState(false);
  const [regenerateMessage, setRegenerateMessage] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchCert() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const url = await getMembershipCertificate(userId, token);
        if (mounted) setCertificateUrl(url);
      } catch (err) {
        if (mounted) setError(err.message || "Error al cargar certificado");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (userId) fetchCert();
    else setLoading(false);

    return () => (mounted = false);
  }, [userId, getToken]);

  // View (open in new tab)
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Download document as blob
  const handleDownloadDocument = async (url, filename) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Regenerate certificate (admin only)
  const handleRegenerate = async () => {
    if (!userId || regenerating) return;

    setRegenerating(true);
    setRegenerateMessage(null);

    try {
      const token = await getToken();
      const newUrl = await regenerateMembershipCertificate(userId, token);

      if (newUrl) {
        setCertificateUrl(newUrl);
        setRegenerateMessage({
          type: "success",
          text: "Certificado regenerado exitosamente.",
        });
      } else {
        setRegenerateMessage({
          type: "error",
          text: "No se pudo obtener la URL del nuevo certificado.",
        });
      }
    } catch (err) {
      setRegenerateMessage({
        type: "error",
        text: err.message || "Error al regenerar el certificado.",
      });
    } finally {
      setRegenerating(false);
      // Auto-dismiss message after 5 seconds
      setTimeout(() => setRegenerateMessage(null), 5000);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Certificados de afiliación</h3>
      </div>

      <div className="h-56 md:h-44 w-full rounded-md flex items-center justify-center bg-[#FAFAFA] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : certificateUrl ? (
          // Show PDF preview when certificate exists
          <iframe
            src={certificateUrl}
            title="Certificado de afiliación"
            className="w-full h-full border-0"
            style={{ background: "#f3f4f6" }}
          />
        ) : (
          // Show message when no certificate exists
          <div className="text-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 1.343-3 3v3h6v-3c0-1.657-1.343-3-3-3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3v2m0 14v2m7-9h2M3 12H1m16.95 6.364l1.414 1.414M4.636 4.636L3.222 3.222m0 16.97l1.414-1.414M20.778 3.222l-1.414 1.414"
              />
            </svg>
            <p className="mt-2">Aún no tienes certificados</p>
            <p className="text-xs text-gray-400">
              Tus certificados aparecerán aquí
            </p>
          </div>
        )}
      </div>

      {/* Feedback message after regeneration */}
      {regenerateMessage && (
        <div
          className={`mt-2 px-3 py-2 rounded text-sm ${regenerateMessage.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {regenerateMessage.text}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        {/* Regenerate button — admin only */}
        {isAdmin ? (
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md border ${regenerating
              ? "text-slate-400 border-slate-200 cursor-not-allowed"
              : "text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
              }`}
            title="Regenerar certificado"
          >
            {regenerating ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Regenerar
              </>
            )}
          </button>
        ) : (
          <div />
        )}

        {/* View and Download buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleViewDocument(certificateUrl)}
            disabled={!certificateUrl}
            className={`text-blue-600 hover:text-blue-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer ${!certificateUrl ? "opacity-40 pointer-events-none" : ""
              }`}
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
                certificateUrl,
                `certificado_${userId}.pdf`
              )
            }
            disabled={!certificateUrl}
            className={`text-slate-600 hover:text-slate-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer ${!certificateUrl ? "opacity-40 pointer-events-none" : ""
              }`}
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
    </section>
  );
}
