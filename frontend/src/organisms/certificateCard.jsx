/**
 * @fileoverview React component for displaying a user's membership certificate.
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Displays a membership certificate for a user, with options to view or download the certificate.
 */

import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { getMembershipCertificate } from "../services/contentServices";

/**
 * CertificateCard
 * @param {string} userId - User ID whose certificate to fetch
 * - Shows membership certificate thumbnail (or embedded PDF)
 * - Buttons: Ver (abre en nueva pestaña) y Descargar
 */

export default function CertificateCard({ userId }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [certificateUrl, setCertificateUrl] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchCert() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const url = await getMembershipCertificate(userId, token);
        
        if (url) {
          try {
            // Verify if the file actually exists to avoid showing S3 XML error
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              if (mounted) setCertificateUrl(url);
            } else {
              // If 404 (NoSuchKey) or other error, treat as no certificate
              console.warn("Certificate file not found (404/403)");
              if (mounted) setCertificateUrl(null);
            }
          } catch (e) {
            // If verification fails (e.g. CORS), we try to show it anyway
            // or we could assume it failed. 
            // Since the user reported NoSuchKey, that's a 404 which doesn't throw.
            // If fetch throws, it's likely a network/CORS issue.
            console.warn("Error verifying certificate:", e);
            if (mounted) setCertificateUrl(url);
          }
        } else {
          if (mounted) setCertificateUrl(null);
        }
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
  // View (open in new tab) reusing DocumentsCard approach
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Download document as blob (reused from DocumentsCard)
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

      <div className="mt-3 flex items-center justify-end">
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
