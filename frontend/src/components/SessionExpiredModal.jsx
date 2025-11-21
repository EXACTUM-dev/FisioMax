/**
 * @fileoverview Modal to inform user that their session has expired.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React from "react";

/**
 * Session expired notification modal
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls whether the modal is open
 * @returns {React.Element} Session expired modal
 */
export default function SessionExpiredModal({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition-opacity">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in fade-in-0 zoom-in-95">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Sesión Expirada
          </h3>

          {/* Message */}
          <p className="text-slate-600 mb-6">
            Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente para continuar.
          </p>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <svg
              className="animate-spin h-5 w-5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Redirigiendo...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
