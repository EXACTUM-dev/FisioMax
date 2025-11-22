/**
 * @fileoverview Unified profile form component - REFACTORED
 * @version 0.2.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import Button from "../atoms/button";
import Modal from "../molecules/modal";
import SuccessErrorModal from "./successErrorModal";
import PersonalInfoSection from "../molecules/personalInfoSection";
import ContactInfoSection from "../molecules/contactInfoSection";
import FullProfileForm from "../molecules/fullProfileForm";

import {
  handleValidatedInputChange,
  validateFormSubmission,
  formatDateForInput,
  PROFILE_VALIDATION_RULES,
} from "../utils/profileFormValidation";

// API endpoints
const COUNTRIES_API_BASE_URL = import.meta.env.VITE_COUNTRIES_API_BASE_URL;
const COUNTRIES_POSITIONS_ENDPOINT = import.meta.env
  .VITE_COUNTRIES_POSITIONS_ENDPOINT;
const COUNTRIES_STATES_ENDPOINT = import.meta.env
  .VITE_COUNTRIES_STATES_ENDPOINT;
const COUNTRIES_CITIES_ENDPOINT = import.meta.env
  .VITE_COUNTRIES_CITIES_ENDPOINT;

export default function ProfileFormSection({
  mode = "full",
  data = {},
  formData = {},
  setFormData,
  errors: externalErrors = {},
  setErrors: setExternalErrors,
  onSave,
  onEditChange,
  isOwn = false,
  canEdit = false,
}) {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [personalForm, setPersonalForm] = useState({});
  const [contactForm, setContactForm] = useState({});
  const [errors, setErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Fetch countries
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          `${COUNTRIES_API_BASE_URL}${COUNTRIES_POSITIONS_ENDPOINT}`
        );
        const dataRes = await res.json();
        const formatted = dataRes.data
          .map((c) => ({ value: c.name, label: c.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(formatted);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    }
    fetchCountries();
  }, []);

  // Notify parent when editing
  useEffect(() => {
    if (mode === "sections" && onEditChange) {
      onEditChange(isEditingPersonal || isEditingContact);
    }
  }, [isEditingPersonal, isEditingContact, mode, onEditChange]);

  // Initialize forms
  useEffect(() => {
    if (mode === "sections") {
      setPersonalForm({
        nombres: data.nombres || "",
        apellidoP: data.apellidoP || "",
        apellidoM: data.apellidoM || "",
        fechaNacimiento: formatDateForInput(data.fechaNacimiento) || "",
        licenciatura: data.licenciatura || "",
      });
      setContactForm({
        email: data.email || data.correo || "",
        telefonoProfesional: data.telefonoProfesional || "",
        telefonoWhatsapp: data.telefonoWhatsapp || "",
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
        facebook: data.facebook || "",
        paginaWeb: data.paginaWeb || "",
      });
      setErrors({});
    }
  }, [data, mode]);

  const handleCountryChange = async (value) => {
    if (mode === "full") {
      setFormData((prev) => ({ ...prev, pais: value, estado: "", ciudad: "" }));
    }
    setStates([]);
    setCities([]);

    try {
      const res = await fetch(
        `${COUNTRIES_API_BASE_URL}${COUNTRIES_STATES_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: value }),
        }
      );
      const dataRes = await res.json();
      setStates(
        dataRes.data?.states?.map((s) => ({ value: s.name, label: s.name })) ||
          []
      );
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const handleStateChange = async (value) => {
    const currentCountry = mode === "full" ? formData.pais : data.pais;
    if (mode === "full") {
      setFormData((prev) => ({ ...prev, estado: value, ciudad: "" }));
    }
    setCities([]);

    try {
      const res = await fetch(
        `${COUNTRIES_API_BASE_URL}${COUNTRIES_CITIES_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: currentCountry, state: value }),
        }
      );
      const dataRes = await res.json();
      setCities(dataRes.data?.map((c) => ({ value: c, label: c })) || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const handleInputChange = (e) => {
    if (mode === "full") {
      handleValidatedInputChange(e, setFormData, setExternalErrors);
    } else if (isEditingPersonal) {
      handleValidatedInputChange(e, setPersonalForm, setErrors);
    } else if (isEditingContact) {
      handleValidatedInputChange(e, setContactForm, setErrors);
    }
  };

  const handleSavePersonal = async () => {
    if (!onSave) return;

    const personalValidationRules = {
      nombres: PROFILE_VALIDATION_RULES.nombres,
      apellidoP: PROFILE_VALIDATION_RULES.apellidoP,
      apellidoM: PROFILE_VALIDATION_RULES.apellidoM,
      fechaNacimiento: PROFILE_VALIDATION_RULES.fechaNacimiento,
      licenciatura: PROFILE_VALIDATION_RULES.licenciatura,
    };

    const validation = validateFormSubmission(
      personalForm,
      personalValidationRules
    );
    setErrors(validation.errors);

    if (validation.missingFields.length > 0) {
      setValidationErrors(validation.missingFields);
      setShowValidationModal(true);
      return;
    }

    if (!validation.isValid) {
      setModalType("error");
      setModalMessage("Por favor corrige los errores antes de guardar.");
      setShowModal(true);
      return;
    }

    try {
      await onSave({
        nombres: personalForm.nombres,
        apellidoP: personalForm.apellidoP,
        apellidoM: personalForm.apellidoM,
        fechaNacimiento: personalForm.fechaNacimiento,
        licenciatura: personalForm.licenciatura,
      });
      setIsEditingPersonal(false);
      setModalType("success");
      setModalMessage(
        "La información personal se ha actualizado exitosamente."
      );
      setShowModal(true);
    } catch (error) {
      setModalType("error");
      setModalMessage(
        error.message || "Error al guardar la información personal."
      );
      setShowModal(true);
    }
  };

  const handleSaveContact = async () => {
    if (!onSave) return;

    const contactValidationRules = {
      email: PROFILE_VALIDATION_RULES.email,
      telefonoProfesional: PROFILE_VALIDATION_RULES.telefonoProfesional,
      telefonoWhatsapp: PROFILE_VALIDATION_RULES.telefonoWhatsapp,
      instagram: PROFILE_VALIDATION_RULES.instagram,
      linkedin: PROFILE_VALIDATION_RULES.linkedin,
      facebook: PROFILE_VALIDATION_RULES.facebook,
      paginaWeb: PROFILE_VALIDATION_RULES.paginaWeb,
    };

    const validation = validateFormSubmission(
      contactForm,
      contactValidationRules
    );
    setErrors(validation.errors);

    if (validation.missingFields.length > 0) {
      setValidationErrors(validation.missingFields);
      setShowValidationModal(true);
      return;
    }

    if (!validation.isValid) {
      setModalType("error");
      setModalMessage("Por favor corrige los errores antes de guardar.");
      setShowModal(true);
      return;
    }

    try {
      await onSave({
        correo: contactForm.email,
        telefonoProfesional: contactForm.telefonoProfesional,
        telefonoWhatsapp: contactForm.telefonoWhatsapp,
        instagram: contactForm.instagram,
        linkedin: contactForm.linkedin,
        facebook: contactForm.facebook,
        paginaWeb: contactForm.paginaWeb,
      });
      setIsEditingContact(false);
      setModalType("success");
      setModalMessage(
        "La información de contacto se ha actualizado exitosamente."
      );
      setShowModal(true);
    } catch (error) {
      setModalType("error");
      setModalMessage(
        error.message || "Error al guardar la información de contacto."
      );
      setShowModal(true);
    }
  };

  if (mode === "full") {
    return (
      <FullProfileForm
        formData={formData}
        errors={externalErrors}
        onChange={handleInputChange}
        countries={countries}
        states={states}
        cities={cities}
        onCountryChange={handleCountryChange}
        onStateChange={handleStateChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PersonalInfoSection
        data={data}
        formData={personalForm}
        errors={errors}
        isEditing={isEditingPersonal}
        canEdit={canEdit}
        onToggleEdit={() => setIsEditingPersonal((v) => !v)}
        onChange={handleInputChange}
        onSave={handleSavePersonal}
        onCancel={() => {
          setIsEditingContact(false);
          setContactForm({
            email: data.email || data.correo || "",
            telefonoProfesional: data.telefonoProfesional || "",
            telefonoWhatsapp: data.telefonoWhatsapp || "",
            instagram: data.instagram || "",
            linkedin: data.linkedin || "",
            facebook: data.facebook || "",
            paginaWeb: data.paginaWeb || "",
          });
          setErrors({});
        }}
      />

      <ContactInfoSection
        data={data}
        formData={contactForm}
        errors={errors}
        isEditing={isEditingContact}
        canEdit={canEdit}
        isOwn={isOwn}
        onToggleEdit={() => setIsEditingContact((v) => !v)}
        onChange={handleInputChange}
        onSave={handleSaveContact}
        onCancel={() => {
          setIsEditingContact(false);
          setContactForm({
            email: data.email || data.correo || "",
            telefonoProfesional: data.telefonoProfesional || "",
            telefonoWhatsapp: data.telefonoWhatsapp || "",
            instagram: data.instagram || "",
            linkedin: data.linkedin || "",
            facebook: data.facebook || "",
            paginaWeb: data.paginaWeb || "",
          });
          setErrors({});
        }}
      />

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
