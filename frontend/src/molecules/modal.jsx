/**
 * @fileoverview Reusable base modal component with confirmation flow support.
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Features responsive sizing, positioning, and optional close confirmation.
 */

// components/molecules/modal/index.jsx
import React, { useState, useEffect, useRef } from "react";
import CloseButton from "../atoms/closeButton";
import ConfirmationModal from "../molecules/confirmationModal";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  //Reference to focus in the first component of the modal
  const modalRef = useRef(null);
  
  // Automatically focus when opening modal
  useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

      // Find the CloseButton and put at the end
      const closeButton = modalRef.current.querySelector('[data-close-button]');
      const filtered = focusableElements.filter((el) => el !== closeButton);

      const first = filtered[0];
      const last = closeButton || filtered[filtered.length - 1];

      const focusTimer = setTimeout(() => {
        first?.focus();
      }, 0);

      // Focus the first element
      first?.focus();

      // Function the catch de Tab navegation
      const handleKeyDown = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            // shift + tab ->
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            // tab normal ->
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      modalRef.current.addEventListener("keydown", handleKeyDown);
      return () => modalRef.current?.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    x2: "max-w-6xl",
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
        ref={modalRef}
        className={`fixed inset-0 z-50 flex ${positionClasses[position]} bg-black/30 transition-opacity`}
        onClick={handleOverlayClick}
      >
        {/* Relative container for the CloseButton position*/}
        <div
          className={`
            relative w-full mx-2 sm:mx-4 
            ${sizeClasses[size]} 
          `}
        >
          {/* Modal container with scroll */}
          <div
            className={`
              bg-white rounded-2xl shadow-xl border border-slate-200 
              p-4 sm:p-6 lg:p-5
              overflow-y-auto max-h-[90vh]
              transition-all duration-200
              animate-in fade-in-0 zoom-in-95
              ${className}
          `}
          >
          {children}
          
          {showCloseButton && (
            <CloseButton
              data-close-button
              onClose={handleCloseRequest}
              size="lg"
              position={{ top: "top-1", right: "right-1" }}
            />
          )}
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
