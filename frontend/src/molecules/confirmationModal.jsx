import React from "react";
import Button from "../atoms/button";

/**
 * Generic confirmation modal.
 * Props:
 * - open: boolean (if it's open or not)
 * - title: string (modal title)
 * - message: string (main message)
 * - confirmLabel: string (confirm text button)
 * - cancelLabel: string (cancel text button)
 * - onConfirm: () => void
 * - onCancel: () => void
 */
export default function ConfirmModal({
  open,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-slate-200">
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
      </div>
    </div>
  );
}