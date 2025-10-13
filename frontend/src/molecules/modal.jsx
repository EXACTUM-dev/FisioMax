// components/molecules/modal/index.jsx
import React, { useState } from "react";
import CloseButton from "../atoms/closeButton";
import ConfirmationModal from "../molecules/confirmationModal";
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
  requireConfirmation = false,
  confirmationTitle = "¿Estás seguro de que deseas salir?",
  confirmationMessage = "Los cambios no guardados se perderán.",
  className = "",
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  const handleCloseRequest = () => {
    if (requireConfirmation) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleCloseRequest();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex ${positionClasses[position]} bg-black/30 transition-opacity`}
        onClick={handleOverlayClick}
      >
        {/* Contenedor relativo para posicionar el CloseButton */}
        <div className="relative">
          {showCloseButton && (
            <CloseButton
              onClose={handleCloseRequest} // Cambiado a handleCloseRequest
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

      {/* Modal de confirmación - necesitarías importar o crear este componente */}
      <ConfirmationModal
        open={showConfirmation}
        title={confirmationTitle}
        message={confirmationMessage}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
}
