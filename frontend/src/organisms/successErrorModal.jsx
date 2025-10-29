/**
 * @fileoverview Reusable modal component for displaying success and error messages.
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Includes customizable icons, titles, and button labels based on message type.
 */

import React from "react";
import Modal from "../molecules/modal";
import Button from "../atoms/button";
import CheckIcon from "../atoms/icons/CheckIcon";

/**
 * SuccessErrorModal - Reusable component for displaying success or error messages
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls whether the modal is open
 * @param {Function} props.onClose - Callback function to execute when modal closes
 * @param {"success"|"error"} props.type - Modal type: success or error
 * @param {string} props.message - Message to display
 * @param {string} props.title - Modal title (optional)
 * @param {string} props.confirmLabel - Button text (optional)
 * @param {"sm"|"md"|"lg"|"xl"} props.size - Modal size (optional, default: "md")
 * @returns {React.Element} Success/error modal component
 */
export default function SuccessErrorModal({
  open,
  onClose,
  type = "success",
  message,
  title,
  confirmLabel,
  size = "md",
}) {
  // Default values based on modal type
  const defaultTitle = type === "success" ? "¡Operación exitosa!" : "Error";
  const defaultConfirmLabel = type === "success" ? "Entendido" : "Intentar nuevamente";

  return (
    <Modal open={open} onClose={onClose} size={size} position="center">
      <div className="text-center">
        {/* Icon container with conditional rendering based on type */}
        <div 
          className="mx-auto flex items-center justify-center mb-4"
          style={{ 
            background: 'transparent',
            boxShadow: 'none',
            filter: 'none'
          }}
        >
          {type === "success" ? (
            <div style={{ background: 'transparent', boxShadow: 'none', filter: 'none' }}>
              <CheckIcon className="h-16 w-16" />
            </div>
          ) : (
            <svg
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Modal title with fallback to default */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title || defaultTitle}
        </h3>

        {/* Message content */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Action button with dynamic label */}
        <Button 
          variant="brand" 
          onClick={onClose} 
          className="w-full"
          label={confirmLabel || defaultConfirmLabel}
        />
      </div>
    </Modal>
  );
}