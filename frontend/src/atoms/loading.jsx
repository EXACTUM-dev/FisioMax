/**
 * @fileoverview Loader atom component (spinner + optional message)
 * @version 0.3.0
 * @author EXACTUM-dev
 */

import React from "react";

/**
 * Reusable loading indicator.
 * - fullscreen: ocupa toda la pantalla (centra el spinner)
 * - message: texto a mostrar debajo del spinner
 * - size: tamaño del spinner en px
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.fullscreen=true] - If true, covers full viewport
 * @param {string} [props.message="Cargando..."] - Label shown under the spinner
 * @param {number} [props.size=48] - Spinner size in pixels
 * @param {string} [props.className=""] - Extra CSS classes for wrapper
 * @returns {JSX.Element} Loading atom
 */
export default function Loading({
  fullscreen = true,
  message = "Cargando...",
  size = 48,
  className = "",
}) {
  const wrapperBase = fullscreen
    ? "min-h-screen bg-[#FAFAFA] flex items-center justify-center"
    : "py-8 flex items-center justify-center";

  return (
    <div
      className={`${wrapperBase} ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-testid="loading"
    >
      <div className="text-center">
        <span
          className="animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 inline-block"
          style={{ width: size, height: size }}
          data-testid="loading-spinner"
        />
        {message ? (
          <p className="mt-4 text-gray-600 text-sm" data-testid="loading-text">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
