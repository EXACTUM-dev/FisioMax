import React from "react";

/**
 * Botón de cerrar (X) para modales y diálogos
 *
 * Props:
 * - onClose: función requerida para manejar el cierre
 * - className: clases adicionales para personalizar
 * - size: "sm" | "md" | "lg" (tamaño del botón)
 * - position: objeto con top, right, left, bottom para posicionamiento
 * - ariaLabel: texto accesible (default: "Cerrar modal")
 */
const CloseButton = (
  {
    onClose,
    className = "",
    size = "md",
    position = { top: "top-3", right: "right-3" },
    ariaLabel = "Cerrar modal",
  },
  ref
) => {
  // Configuración de tamaños
  const sizeClasses = {
    sm: "w-6 h-6 text-base",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-xl",
  };

  // Clases base
  const baseClasses =
    "absolute flex items-center justify-center font-normal border-0 bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200 cursor-pointer z-60 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50";

  // Clases de posicionamiento
  const positionClasses = `${position.top || ""} ${position.right || ""} ${
    position.left || ""
  } ${position.bottom || ""}`;

  return (
    <button
      ref={ref}
      onClick={onClose}
      className={`${baseClasses} ${sizeClasses[size]} ${positionClasses} ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      x
    </button>
  );
};

export default CloseButton;
