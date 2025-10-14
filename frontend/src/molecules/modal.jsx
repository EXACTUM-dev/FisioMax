// components/molecules/modal/index.jsx
import React, { useState } from "react";
import CloseButton from "../atoms/closeButton";
import ConfirmationModal from "../molecules/confirmationModal";

/**
 * Author: Jaime Trujillo
 * Version: 1.0.0
 * Reusable base modal component with confirmation flow support.
 * Features responsive sizing, positioning, and optional close confirmation.
 */

/**
 * Base reusable modal component
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls whether the modal is open
 * @param {Function} props.onClose - Callback function to execute when modal closes
 * @param {React.ReactNode} props.children - Modal content
 * @param {"sm"|"md"|"lg"|"xl"|"full"} props.size - Modal size variant
 * @param {"center"|"top"|"bottom"} props.position - Modal vertical positioning
 * @param {boolean} props.closeOnOverlayClick - Whether clicking overlay closes modal
 * @param {boolean} props.showCloseButton - Whether to show close button
 * @param {boolean} props.requireConfirmation - Whether to show confirmation before closing
 * @param {string} props.confirmationTitle - Title for confirmation modal
 * @param {string} props.confirmationMessage - Message for confirmation modal
 * @param {string} props.className - Additional CSS classes for customization
 * @returns {React.Element} Base modal component
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
  // State for confirmation modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Return null if modal is not open
  if (!open) return null;

  // Size configuration mapping
  const sizeClasses = {
    sm: "max-w-sm w-full mx-4",
    md: "max-w-md w-full mx-4",
    lg: "max-w-lg w-full mx-4",
    xl: "max-w-4xl w-full mx-4",
    full: "w-full mx-4",
  };

  // Position configuration mapping
  const positionClasses = {
    center: "items-center justify-center p-4",
    top: "items-start justify-center pt-8 p-4",
    bottom: "items-end justify-center pb-8 p-4",
  };

  /**
   * Handle close request with confirmation flow
   */
  const handleCloseRequest = () => {
    if (requireConfirmation) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  /**
   * Handle confirmed close action
   */
  const handleConfirmClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  /**
   * Handle canceled close action
   */
  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  /**
   * Handle overlay click with close condition
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleCloseRequest();
    }
  };

  return (
    <>
      {/* Main modal overlay and container */}
      <div
        className={`fixed inset-0 z-50 flex ${positionClasses[position]} bg-black/30 transition-opacity`}
        onClick={handleOverlayClick}
      >
        <div className="w-full flex justify-center">
          {/* Main modal container with relative positioning */}
          <div className={`relative ${sizeClasses[size]}`}>
            
            {/* Close button positioned absolutely outside content */}
            {showCloseButton && (
              <div className="absolute -top-3 -right-3 z-50">
                <CloseButton
                  onClose={handleCloseRequest}
                  size="lg"
                  className="bg-white hover:bg-red-50 rounded-full p-2 shadow-lg border border-slate-200 text-slate-700 hover:text-red-600"
                />
              </div>
            )}
            
            {/* Modal content container with scroll */}
            <div
              className={`
                bg-white rounded-2xl shadow-xl w-full 
                p-6 sm:p-8 md:p-10 border border-slate-200
                overflow-y-auto max-h-[90vh]
                animate-in fade-in-0 zoom-in-95 duration-200
                ${className}
              `}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal for close validation */}
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