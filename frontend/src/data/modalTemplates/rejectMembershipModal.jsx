/**
 * @fileoverview Modal component for rejecting a membership application.
 * @version 1.0.0
 * @description Displays a text field to specify the reason for rejection and confirm the action.
 */

import React, { useState } from "react";
import Button from "../../atoms/button";
import FormField from "../../molecules/form";
import { Title2, Paragraph2 } from "../../atoms/typography";
import Modal from "../../molecules/modal";

/**
 * RejectMembershipModal component.
 *
 * This component provides a modal dialog where the reviewer can specify
 * the reason for rejecting a membership request.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.open - Controls modal visibility.
 * @param {Function} props.onCancel - Called when the user cancels or closes the modal.
 * @param {Function} props.onConfirm - Called when the user confirms the rejection.
 * @param {string} [props.title="Rechazar solicitud"] - Title displayed at the top of the modal.
 * @param {string} [props.subtitle] - Optional explanatory text shown below the title.
 * @returns {JSX.Element|null} The rendered modal component or null if closed.
 */
export default function RejectMembershipModal({
  open,
  onCancel,
  onConfirm,
  title = "Rechazar solicitud",
  subtitle = "A continuación, proporcione el motivo por el cual la solicitud de membresía fue rechazada.",
}) {
  // State to store the rejection reason entered by the user
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // If the modal is not open, do not render anything
  if (!open) return null;

  /**
   * Handles clicks on the backdrop area to close the modal
   * when the user clicks outside the modal content.
   * @param {MouseEvent} e - Click event.
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Debes ingresar el motivo del rechazo.");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="md"
      position="center"
      showCloseButton
      closeOnOverlayClick
      requireConfirmation={false} // Set to true if confirmation before closing is desired
      onClick={handleBackdropClick}
    >
      {/* Modal content layout */}
      <div className="flex flex-col">
        {/* Title and subtitle */}
        <Title2 className="text-center mb-4">{title}</Title2>
        <Paragraph2 className="text-center mb-6 leading-relaxed">
          {subtitle}
        </Paragraph2>

        {/* Text input for rejection reason */}
        <FormField
          label="Motivo del rechazo de membresía"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ingresar razón"
          required
          multiline
          rows={4}
        />
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <Button
            label="Cancelar"
            variant="outline"
            onClick={onCancel}
            radius="xl"
            className="min-w-[120px] border-gray-300 text-gray-700 hover:bg-gray-100"
          />
          <Button
            label="Continuar"
            variant="brand"
            onClick={handleConfirm}
            radius="xl"
            className="min-w-[120px] bg-[#E0E000] hover:bg-[#d0d000] text-black font-medium"
          />
        </div>
      </div>
    </Modal>
  );
}
