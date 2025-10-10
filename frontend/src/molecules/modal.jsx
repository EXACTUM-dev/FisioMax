// components/molecules/modal/index.jsx
import React from "react";
import CloseButton from "../atoms/closeButton";

/**
 * Modal base reutilizable
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - children: React.ReactNode
 * - size: "sm" | "md" | "lg" | "xl" | "full"
 * - position: "center" | "top" | "bottom"
 * - closeOnOverlayClick: boolean
 * - showCloseButton: boolean
 * - className: string
 */
export default function Modal({
  open,
  onClose,
  children,
  size = "lg",
  position = "center",
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = "",
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  const positionClasses = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-8",
    bottom: "items-end justify-center pb-8",
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses[position]} bg-black/30 transition-opacity`}
      onClick={handleOverlayClick}
    >
      {/* Contenedor relativo para posicionar el CloseButton */}
      <div className="relative">
        {showCloseButton && (
          <CloseButton
            onClose={onClose}
            size="lg"
            position={{ top: "top-1", right: "right-1" }}
          />
        )}
        {/* Contenedor del modal con scroll */}
        <div
          className={`
          bg-white rounded-2xl shadow-xl w-full 
          ${sizeClasses[size]} 
          p-10 border border-slate-200 relative
          overflow-y-auto max-h-[90vh]
          animate-in fade-in-0 zoom-in-95 duration-200
          ${className}
        `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
