/**
 * @fileoverview History card component for displaying user history/stats.
 * Shows service hours from membership data.
 * @version 2.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import EditButton from "../atoms/editButton";
import SuccessErrorModal from "./successErrorModal";
import Button from "../atoms/button";
import FormField from "../molecules/form";

/**
 * Displays user history/stats card with editable field for service hours.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User data containing membershipHoursFormation.
 * @param {boolean} [props.canEdit=false] - Whether editing is allowed.
 * @param {Function} [props.onSave] - Callback function to save history changes.
 * @return {!JSX.Element} History card component.
 */

export default function HistoryCard({
  data = {},
  canEdit = false,
  onSave,
  onEditChange,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Notify parent component when editing state changes
  useEffect(() => {
    if (onEditChange) {
      onEditChange(isEditing);
    }
  }, [isEditing, onEditChange]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  // Get horasFormacion from membership data
  const horasFormacion =
    data.membershipHoursFormation || data.horasServicio || "";
  const [form, setForm] = useState({
    horasServicio: horasFormacion,
  });

  // Reset form when data changes
  useEffect(() => {
    const horasFormacionValue =
      data.membershipHoursFormation || data.horasServicio || "";
    setForm({
      horasServicio: horasFormacionValue,
    });
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;
    // Only allow numbers and limit to 11 characters
    const numericValue = value === "" ? "" : value.replace(/\D/g, "");
    const limitedValue = numericValue.length > 4 ? numericValue.slice(0, 4) : numericValue;
    setForm((prev) => ({ ...prev, [name]: limitedValue }));
  }

  async function handleSave() {
    if (!onSave) return;
    try {
      await onSave({
        membershipHoursFormation: form.horasServicio || null,
      });
      setIsEditing(false);

      // Show success modal
      setModalType("success");
      setModalMessage(
        "Las horas de formación se han actualizado exitosamente."
      );
      setShowModal(true);
    } catch (error) {
      console.error("Error saving history:", error);
      // Show error modal
      setModalType("error");
      setModalMessage(
        error.message ||
          "Error al guardar las horas de formación. Por favor, intente nuevamente."
      );
      setShowModal(true);
    }
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">Historial</h3>
        {canEdit && (
          <EditButton
            isEditing={isEditing}
            onClick={() => setIsEditing((v) => !v)}
            editLabel="Editar"
            cancelLabel="Cancelar"
          />
        )}
      </div>

      <div className="text-center text-sm text-slate-700">
        <div>
          {isEditing ? (
            <FormField
              label="Horas de formación"
              type="text"
              name="horasServicio"
              value={form.horasServicio}
              onChange={handleChange}
              placeholder="0"
              maxLength={4}
              showCounter={true}
            />
          ) : (
            <>
              <div className="text-xs text-slate-500">Horas de formación</div>
              <div className="font-medium mt-2">{horasFormacion || "—"}</div>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              // Restaurar valores originales
              const horasFormacionValue =
                data.membershipHoursFormation || data.horasServicio || "";
              setForm({
                horasServicio: horasFormacionValue,
              });
            }}
          >
            Cancelar
          </Button>
          <Button type="button" variant="brand" size="sm" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      )}

      {/* Success/Error Modal */}
      <SuccessErrorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalMessage}
        title={
          modalType === "success"
            ? "¡Operación exitosa!"
            : "Error en la operación"
        }
      />
    </section>
  );
}
