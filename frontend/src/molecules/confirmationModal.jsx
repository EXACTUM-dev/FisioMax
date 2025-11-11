/**
 * @fileoverview Generic confirmation modal for user decision flows.
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Provides consistent styling and accessibility for confirmation dialogs.
 */

import React from "react";
import Button from "../atoms/button";
import Modal from "../molecules/modal"

/**
 * Generic confirmation modal for user decision flows
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
    <Modal
    open={open}
    onClose={onCancel}
    size="sm"
    position="center"
    closeOnOverlayClick={true}
    showCloseButton={false}
    className="text-center"
    >
      <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600 mb-6">{message}</p>
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
    </Modal>
  );
}