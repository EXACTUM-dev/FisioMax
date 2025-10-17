import React from "react";

/**
 * Átomo de loader reutilizable.
 * - fullscreen: ocupa toda la pantalla (centra el spinner)
 * - message: texto a mostrar debajo del spinner
 * - size: tamaño del spinner en px
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
