/**
 * @fileoverview Membership application form
 * @description Page for users to apply for membership
 * @version 0.2.0
 * @author EXACTUM-dev
 */
import React, { useState, useEffect, useRef } from "react";
import PrivacyNoticeModal from "../molecules/privacyNoticeModal";
import CheckBox from "../atoms/checkBox";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../atoms/button";
import BackButton from "../atoms/backButton";
import FileUpload from "../molecules/fileUpload";
import Modal from "../molecules/modal";
import ConfirmModal from "../molecules/confirmationModal";
import { MEMBERSHIP_API } from "../config/api";
import logo from "../assets/icons/SOMEFIPPlogo.png";

import ProfileFormSection from "../organisms/profileFormSection";

import {
  handleValidatedFileChange,
  validateFormSubmission,
  validateExtraDocument,
  prepareFormDataForSubmission,
  INITIAL_FORM_STATE,
  PROFILE_VALIDATION_RULES,
} from "../utils/profileFormValidation";

import MembershipInfoModal from "../overviewPage/membershipInfoModal";

export default function MembershipApplicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);

  const initialMembershipType = location.state?.selectedPlan || "";
  const [showInfoFormation, setShowInfoFormation] = useState(false);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_STATE,
    membershipType: initialMembershipType,
    membershipHoursFormation: "",
  });
  const handleMembershipChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [extraDocs, setExtraDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(
    (location.state?.showInfoModal && location.state?.fromOverview === true) || false
  );
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const hasFormData = () => {
    const hasTextData = Object.entries(formData).some(([key, value]) => {
      if (key === "titulo" || key === "cedula" || key === "constancias")
        return false;
      return typeof value === "string" && value.trim() !== "";
    });
    return (
      hasTextData ||
      formData.titulo ||
      formData.cedula ||
      formData.constancias ||
      extraDocs.length > 0
    );
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasFormData() && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, extraDocs]);

  const handleFileChange = (e) =>
    handleValidatedFileChange(e, setFormData, setErrors);

  const validateForm = () => {
    const validation = validateFormSubmission(
      formData,
      PROFILE_VALIDATION_RULES
    );
    setErrors(validation.errors);
    if (validation.missingFields.length > 0) {
      setValidationErrors(validation.missingFields);
      setShowValidationModal(true);
      return false;
    }
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!privacyChecked) {
      setShowPrivacyNotice(true);
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = prepareFormDataForSubmission(
        {
          ...formData,
          membershipType: formData.membershipType,
          membershipHoursFormation: formData.membershipHoursFormation,
          membershipHoursSocial: formData.membershipHoursSocial,
        },
        extraDocs
      );
      const res = await fetch(MEMBERSHIP_API.CREATE, {
        method: "POST",
        body: formDataToSend,
      });
      // FormData prepared and sent
      const result = await res.json();

      if (res.ok) {
        setModalType("success");
        setModalMessage(
          result.message ||
          "Tu solicitud de membresía ha sido enviada exitosamente."
        );
        setShowModal(true);
        isNavigatingRef.current = true;
        if (location.state?.fromOverview === true) {
          navigate("/login?mode=signup&fromMembership=1");
          return;
        }
      } else if (res.status === 409) {
        setModalType("error");
        setModalMessage("Este correo o teléfono ya está registrado");
        setShowModal(true);
      } else {
        setModalType("error");
        setModalMessage(
          result.message || "Hubo un error al enviar tu solicitud."
        );
        setShowModal(true);
      }
    } catch (err) {
      setModalType("error");
      setModalMessage("No se pudo conectar con el servidor.");
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  const MAX_EXTRA_DOCS = 10;

  const handleAddDocuments = () => {
    if (extraDocs.length < MAX_EXTRA_DOCS) {
      setExtraDocs((prev) => [...prev, { id: Date.now(), file: null }]);
    }
  };

  const handleExtraFileChange = (id, e) => {
    const file = e.target.files[0] || null;
    const index = extraDocs.findIndex((doc) => doc.id === id);
    setExtraDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file } : doc))
    );
    setErrors((prev) => ({
      ...prev,
      [`extraDoc${index}`]: validateExtraDocument(file),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MembershipInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        selectedPlan={formData.membershipType}
      />
      <div className="border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <img
              src={logo}
              alt="SOMEFIPP Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <h1 className="text-center text-xl font-semibold text-gray-800 ml-3">
              Sociedad Mexicana de Fisioterapia en Piso Pélvico
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-8">
              <BackButton
                onClick={() => {
                  if (hasFormData()) {
                    setShowConfirmModal(true);
                  } else {
                    isNavigatingRef.current = true;
                    navigate(-1);
                  }
                }}
              />
              <h2 className="text-center text-2xl font-bold text-gray-800">
                Registro de solicitud
              </h2>
            </div>

            <ProfileFormSection
              mode="full"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />

            {/* Documentation section */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">
              Documentación
            </h3>
            <div className="space-y-6">
              <FileUpload
                name="titulo"
                label="Título/Kardex"
                required
                value={formData.titulo}
                onChange={handleFileChange}
                error={errors.titulo}
              />
              <FileUpload
                name="cedula"
                label="Cédula profesional"
                value={formData.cedula}
                onChange={handleFileChange}
                error={errors.cedula}
              />
              <FileUpload
                name="constancias"
                label="Constancias pélvicas"
                value={formData.constancias}
                onChange={handleFileChange}
                error={errors.constancias}
              />

              {extraDocs.map((doc, i) => (
                <div key={doc.id} className="relative">
                  <FileUpload
                    name={`extra-${doc.id}`}
                    label={`Documento adicional ${i + 1}`}
                    value={doc.file}
                    onChange={(e) => handleExtraFileChange(doc.id, e)}
                    error={errors[`extraDoc${i}`]}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExtraDocs((prev) =>
                        prev.filter((d) => d.id !== doc.id)
                      )
                    }
                    className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-sm mt-1 mr-1"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <Button
                variant="newDoc"
                size="sm"
                onClick={handleAddDocuments}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                type="button"
                disabled={extraDocs.length >= MAX_EXTRA_DOCS}
              >
                Agregar documentos adicionales
              </Button>
              {extraDocs.length >= MAX_EXTRA_DOCS && (
                <p className="text-xs text-red-500 mt-2">
                  Solo puedes agregar hasta 10 documentos adicionales.
                </p>
              )}

              <div className="flex flex-col gap-2 pt-6">
                <div className="flex items-center gap-2">
                  <CheckBox
                    checked={privacyChecked}
                    onChange={() => setPrivacyChecked((v) => !v)}
                    id="privacy-check"
                  />
                  <label htmlFor="privacy-check" className="text-sm text-gray-700 select-none cursor-pointer">
                    He leído y acepto el
                    <button
                      type="button"
                      className="ml-1 underline text-brand hover:text-brand-dark cursor-pointer"
                      onClick={() => setShowPrivacyNotice(true)}
                    >
                      Aviso de Privacidad
                    </button>
                  </label>
                </div>
                <div className="flex justify-end">
                  <Button variant="brand" type="submit" disabled={isSubmitting || !privacyChecked}>
                    {isSubmitting ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>
                  <PrivacyNoticeModal
                    open={showPrivacyNotice}
                    onClose={() => setShowPrivacyNotice(false)}
                  />
            </div>
          </div>
        </form>
      </div>

      {/* Modals */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          if (modalType === "success") {
            navigate("/panel");
          }
        }}
        size="md"
        position="center"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            {modalType === "success" ? (
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {modalType === "success"
              ? "¡Solicitud enviada!"
              : "Error al enviar"}
          </h3>
          <p className="text-gray-600 mb-6">{modalMessage}</p>
          <Button
            variant="brand"
            onClick={() => {
              setShowModal(false);
              if (modalType === "success") {
                navigate("/panel");
              }
            }}
            className="w-full"
          >
            {modalType === "success" ? "Entendido" : "Intentar nuevamente"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={showConfirmModal}
        title="¿Deseas salir de esta página?"
        message="Tienes información sin guardar. Si sales ahora, perderás todos los datos ingresados."
        confirmLabel="Sí, salir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          isNavigatingRef.current = true;
          navigate(-1);
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      <Modal
        open={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        size="md"
        position="center"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            <svg
              className="h-16 w-16 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Campos requeridos faltantes
          </h3>
          <p className="text-gray-600 mb-6">
            Por favor completa los siguientes campos obligatorios:
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <ul className="text-left text-gray-700 space-y-2">
              {validationErrors.map((field, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-orange-500 mr-2">•</span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="brand"
            onClick={() => setShowValidationModal(false)}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
