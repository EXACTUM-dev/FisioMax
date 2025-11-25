/**
 * @fileoverview Membership card component for displaying membership information.
 * Shows registration date, expiration date, and membership plan.
 * @version 1.2.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import Button from "../atoms/button";
import EditButton from "../atoms/editButton";
import Dropdown from "../molecules/dropdown";
import SuccessErrorModal from "./successErrorModal";
import PaymentService from "../services/paymentService";
import FormField from "../molecules/form";

// Membership prices in MXN (per year)
const MEMBERSHIP_PRICES = {
  Estudiante: 900,
  "Licenciado en Formación": 1100,
  "Licenciado Especializado": 1500,
  "Fisioterapeuta Extranjero": 1800,
  "Personal de la Salud": 1300,
  básica: 5,
};
/**
 * Displays user's membership information and payment button.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing membership information.
 * @param {boolean} props.canEdit - Whether the current user can edit this membership.
 * @param {Function} props.onSave - Callback function to save changes.
 * @param {Function} props.onEditChange - Callback to notify parent of edit state changes.
 * @return {!JSX.Element} Membership card component.
 */
export default function MembershipCard({
  data = {},
  canEdit = false,
  onSave,
  onEditChange,
}) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    membershipType: "",
    membershipRegisteredAt: "",
    membershipExpiresAt: "",
    membershipPaymentStatus: "",
    membershipNoAfiliado: "",
  });

  // Local state for success/error feedback modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // "success" | "error"
  const [modalMessage, setModalMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Initialize form data when data changes or entering edit mode
  useEffect(() => {
    if (data && isEditing) {
      setFormData({
        membershipType: data.membershipType || "",
        membershipRegisteredAt: data.membershipRegisteredAt
          ? data.membershipRegisteredAt.split("T")[0]
          : "",
        membershipExpiresAt: data.membershipExpiresAt
          ? data.membershipExpiresAt.split("T")[0]
          : "",
        membershipPaymentStatus: data.membershipPaymentStatus || "Pendiente",
        membershipNoAfiliado: data.membershipNoAfiliado || "",
      });
    }
  }, [data, isEditing]);

  // Notify parent component of edit state
  useEffect(() => {
    if (onEditChange) {
      onEditChange(isEditing);
    }
  }, [isEditing, onEditChange]);

  const registeredAt = data.membershipRegisteredAt
    ? new Date(data.membershipRegisteredAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const expiresAt = data.membershipExpiresAt
    ? new Date(data.membershipExpiresAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const plan = data.membershipType || "No asignado";
  const hoursFormation = data.membershipHoursFormation || 0;
  const paymentStatus = data.membershipPaymentStatus || "Pendiente";

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      membershipType: data.membershipType || "",
      membershipRegisteredAt: data.membershipRegisteredAt
        ? data.membershipRegisteredAt.split("T")[0]
        : "",
      membershipExpiresAt: data.membershipExpiresAt
        ? data.membershipExpiresAt.split("T")[0]
        : "",
      membershipPaymentStatus: data.membershipPaymentStatus || "Pendiente",
      membershipNoAfiliado: data.membershipNoAfiliado || "",
    });
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        // Format the date to ISO string if it exists
        const dataToSave = {
          membershipType: formData.membershipType,
          membershipRegisteredAt: formData.membershipRegisteredAt
            ? new Date(formData.membershipRegisteredAt).toISOString()
            : null,
          membershipExpiresAt: formData.membershipExpiresAt
            ? new Date(formData.membershipExpiresAt).toISOString()
            : null,
          membershipPaymentStatus: formData.membershipPaymentStatus,
          membershipNoAfiliado: formData.membershipNoAfiliado,
        };

        await onSave(dataToSave);
        setIsEditing(false);

        // Show success feedback modal (same UX pattern as AddressCard)
        setModalType("success");
        setModalMessage(
          "La información de la membresía se ha actualizado correctamente."
        );
        setShowModal(true);
      } catch (error) {
        console.error("Error al guardar cambios de membresía:", error);
        // Keep in edit mode on error

        // Show error feedback modal
        setModalType("error");
        setModalMessage(
          error?.message ||
            "Ocurrió un error al actualizar la información de la membresía. Por favor, inténtalo de nuevo."
        );
        setShowModal(true);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);

      const membershipType = data.membershipType || "básica";
      const amount = MEMBERSHIP_PRICES[membershipType] || 1500;

      // Create payment preference and redirect to Mercado Pago
      await PaymentService.createPreferenceAndPay(
        {
          membershipType,
          amount,
        },
        getToken
      );
    } catch (error) {
      console.error("Error al iniciar pago:", error);
      setModalType("error");
      setModalMessage(
        error?.message ||
          "No se pudo iniciar el proceso de pago. Por favor, inténtalo de nuevo."
      );
      setShowModal(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Options for membership type dropdown
  const membershipTypeOptions = [
    { value: "Estudiante", label: "Estudiante" },
    { value: "Licenciado en Formación", label: "Licenciado en Formación" },
    { value: "Licenciado Especializado", label: "Licenciado Especializado" },
    { value: "Fisioterapeuta Extranjero", label: "Fisioterapeuta Extranjero" },
    { value: "Personal de la Salud", label: "Personal de la Salud" },
    { value: "básica", label: "Básica" },
  ];

  // Options for payment status dropdown
  const paymentStatusOptions = [
    { value: "Pendiente", label: "Pendiente" },
    { value: "Pagado", label: "Pagado" },
    { value: "Vencido", label: "Vencido" },
  ];

  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-md w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Membresía</h3>
        {canEdit && !isEditing && <EditButton onClick={handleEdit} />}
      </div>

      {!isEditing ? (
        <>
          <div className="text-sm text-slate-700 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha de registro</span>
              <span className="font-medium">{registeredAt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Fecha de vencimiento</span>
              <span className="font-medium">{expiresAt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Plan de membresía</span>
              <span className="font-medium capitalize">{plan}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Afiliado NO</span>
              <span className="font-medium">{data.membershipNoAfiliado || "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Estatus de pago</span>
              <span
                className={`font-medium capitalize ${paymentStatus === "Pagado"
                  ? "text-green-600"
                  : paymentStatus === "Pendiente"
                    ? "text-yellow-600"
                    : "text-red-600"
                  }`}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="mt-4">
              <Button
                size="sm"
                label={
                  isProcessingPayment ? "Procesando..." : "Pagar membresía"
                }
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="cursor-pointer"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-slate-700 space-y-4">
            <div>
              <label
                htmlFor="membershipRegisteredAt"
                className="block text-slate-500 mb-1"
              >
                Fecha de registro
              </label>
              <input
                id="membershipRegisteredAt"
                type="date"
                value={formData.membershipRegisteredAt}
                onChange={(e) =>
                  handleChange("membershipRegisteredAt", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="membershipExpiresAt"
                className="block text-slate-500 mb-1"
              >
                Fecha de vencimiento
              </label>
              <input
                id="membershipExpiresAt"
                type="date"
                value={formData.membershipExpiresAt}
                onChange={(e) =>
                  handleChange("membershipExpiresAt", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
            </div>

            <div>
              <Dropdown
                name="membershipType"
                label="Plan de membresía"
                value={formData.membershipType}
                onChange={(e) => handleChange("membershipType", e.target.value)}
                options={membershipTypeOptions}
                placeholder="Seleccionar plan"
              />
            </div>

            <div>
              <FormField
                label="Afiliado NO"
                name="membershipNoAfiliado"
                required
                value={formData.membershipNoAfiliado}
                onChange={(e) => handleChange("membershipNoAfiliado", e.target.value)}
                placeholder="Número de afiliado"
                maxLength={6}
              />
            </div>

            <div>
              <Dropdown
                name="membershipPaymentStatus"
                label="Estatus de pago"
                value={formData.membershipPaymentStatus}
                onChange={(e) =>
                  handleChange("membershipPaymentStatus", e.target.value)
                }
                options={paymentStatusOptions}
                placeholder="Seleccionar estatus"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleSave}
              className="cursor-pointer"
            >
              Guardar
            </Button>
          </div>
        </>
      )}

      {/* Success/Error modal to confirm whether save was successful or failed */}
      < SuccessErrorModal
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
    </aside>
  );
}
