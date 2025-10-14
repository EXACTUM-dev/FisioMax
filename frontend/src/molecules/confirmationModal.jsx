import React from "react";
import Button from "../atoms/button";

/**
 * Author: Jaime Trujillo
 * Version: 1.0.0
 * Generic confirmation modal for user decision flows.
 * Provides consistent styling and accessibility for confirmation dialogs.
 */

/**
 * Generic confirmation modal for user decision flows
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls whether the modal is open
 * @param {string} props.title - Modal title text
 * @param {string} props.message - Main message content
 * @param {string} props.confirmLabel - Confirm button text (default: "Confirmar")
 * @param {string} props.cancelLabel - Cancel button text (default: "Cancelar")
 * @param {Function} props.onConfirm - Callback function for confirm action
 * @param {Function} props.onCancel - Callback function for cancel action
 * @returns {React.Element} Confirmation modal component
 */
export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  // Return null if modal is not open
  if (!open) return null;

  /**
   * Handle backdrop click to trigger cancel action
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
      onClick={handleBackdropClick}
    >
      {/* Modal content container */}
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-slate-200">
        {/* Modal title */}
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        
        {/* Modal message content */}
        <p className="text-slate-600 mb-6">{message}</p>
        
        {/* Action buttons container */}
        <div className="flex justify-center gap-3">
          <Button
            label={cancelLabel}
            variant="outline"
            onClick={onCancel}
            radius="xl"
          />
          <Button
            label={confirmLabel}
            variant="brand"
            onClick={onConfirm}
            radius="xl"
          />
        </div>
      </div>
    </div>
  );
}