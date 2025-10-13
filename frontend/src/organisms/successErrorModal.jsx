/**
 * SuccessErrorModal - Componente reutilizable para mostrar mensajes de éxito o error
 * @param {boolean} open - Controla si el modal está abierto
 * @param {function} onClose - Función a ejecutar al cerrar el modal
 * @param {string} type - Tipo de modal: "success" | "error"
 * @param {string} message - Mensaje a mostrar
 * @param {string} title - Título del modal (opcional)
 * @param {string} confirmLabel - Texto del botón (opcional)
 * @param {string} size - Tamaño del modal (opcional, default: "md")
 */

import React from "react";
import Modal from "../molecules/Modal";
import Button from "../atoms/Button";

export default function SuccessErrorModal({
  open,
  onClose,
  type = "success",
  message,
  title,
  confirmLabel,
  size = "md",
}) {
  // Valores por defecto según el tipo
  const defaultTitle = type === "success" ? "¡Operación exitosa!" : "Error";
  const defaultConfirmLabel = type === "success" ? "Entendido" : "Intentar nuevamente";

  return (
    <Modal open={open} onClose={onClose} size={size} position="center">
      <div className="text-center">
        {/* Icono según el tipo */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
          {type === "success" ? (
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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

        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title || defaultTitle}
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Botón */}
        <Button variant="brand" onClick={onClose} className="w-full">
          {confirmLabel || defaultConfirmLabel}
        </Button>
      </div>
    </Modal>
  );
}