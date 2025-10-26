/**
 * @fileoverview Function to fetch (...)
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Optional description of the file
 */

import React from "react";

/**
 * Attractive, yet subtle alert banner.
 * @component
 * @param {Object} props
 * @param {"error"|"warning"|"info"|"success"} [props.type="error"]
 * @param {string} props.message
 * @param {Function} [props.onRetry]
 * @param {Function} [props.onClose]
 * @param {boolean} [props.closable=false]
 * @param {string} [props.className=""]
 * @returns {React.Element}
 */
export default function AlertBanner({
  type = "error",
  message = "",
  onRetry,
  onClose,
  closable = false,
  className = "",
}) {
  const palette = {
    error: {
      bg: "bg-red-50",
      accent: "bg-red-500",
      text: "text-red-900",
      btn: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      bg: "bg-amber-50",
      accent: "bg-amber-500",
      text: "text-amber-900",
      btn: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      bg: "bg-sky-50",
      accent: "bg-sky-500",
      text: "text-sky-900",
      btn: "bg-sky-600 hover:bg-sky-700",
    },
    success: {
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
      text: "text-emerald-900",
      btn: "bg-emerald-600 hover:bg-emerald-700",
    },
  };

  const p = palette[type] || palette.error;

  const Icon = () => {
    if (type === "success")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    if (type === "warning")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M12 9v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    if (type === "info")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M13 16h-1v-4h-1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    // error
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M18.36 5.64L5.64 18.36"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M5.64 5.64l12.72 12.72"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 ${p.bg} ${p.text} ${className}`}
    >
      {/* Center vertically: icon, text and actions */}
      <div className="flex items-center gap-4 p-4">
        {/* icon */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-md ${p.accent} bg-opacity-95 text-white shadow-sm flex-shrink-0`}
          aria-hidden
        >
          <Icon />
        </div>

        {/* content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium">{message}</p>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 ml-4">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`px-3 py-1.5 text-sm text-white rounded-md ${p.btn} transition-colors`}
            >
              Reintentar
            </button>
          )}

          {closable && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar alerta"
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
