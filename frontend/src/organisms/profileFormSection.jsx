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
const API_KEY = import.meta.env.VITE_COUNTRIES_API_KEY;
const BASE_URL = "https://api.countrystatecity.in/v1";

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
  const [localData, setLocalData] = useState(null); // countries_nested.json

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Fetch countries
  useEffect(() => {
    // Intentar cargar archivo local `countries_nested.json` desde `public/`.
    async function fetchCountries() {
      const LOCAL_URL = "/countries_nested.json";
      try {
        const localRes = await fetch(LOCAL_URL);
        if (localRes.ok) {
          const localJson = await localRes.json();
          setLocalData(localJson);
          const formattedLocal = localJson
            .map((c) => ({
              value: c.name_en || c.name_es || c.name,
              label: c.name_en || c.name_es || c.name,
              id: c.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setCountries(formattedLocal);
          return;
        }
      } catch (err) {
        // silencioso: si falla, fallback a la API
      }

      // Fallback a la API remota si no existe el JSON local
      try {
        const res = await fetch(`${BASE_URL}/countries`, {
          headers: { "X-CSCAPI-KEY": API_KEY },
        });
        const dataRes = await res.json();
        const formatted = dataRes
          .map((c) => ({ value: c.name, label: c.name, iso2: c.iso2 }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(formatted);
      } catch (err) {
        setError("Error al cargar paises. Por favor intente más tarde.");
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

  // Auto-load states when country is already selected (e.g., Mexico preset)
  useEffect(() => {
    async function loadStatesForPresetCountry() {
      if (mode === "full" && formData.pais && countries.length > 0) {
        // If we have local JSON, get states from there
        if (localData) {
          const selected = localData.find(
            (c) => c.name_en === formData.pais || c.name_es === formData.pais
          );
          if (selected) {
            const localStates = (selected.states || []).map((s) => ({
              value: s.name_en || s.name_es || s.name,
              label: s.name_en || s.name_es || s.name,
              id: s.id,
            }));
            setStates(localStates);

            // Load cities if state is also preset
            if (formData.estado) {
              const stateObj = (selected.states || []).find(
                (s) => s.name_en === formData.estado || s.name_es === formData.estado
              );
              if (stateObj) {
                const localCities = (stateObj.cities || []).map((c) => ({
                  value: c.name_en || c.name_es || c.name,
                  label: c.name_en || c.name_es || c.name,
                  id: c.id,
                }));
                setCities(localCities);
              }
            }
            return;
          }
        }

        // Fallback to API
        const selectedCountry = countries.find((c) => c.value === formData.pais);
        if (selectedCountry && selectedCountry.iso2) {
          try {
            const res = await fetch(
              `${BASE_URL}/countries/${selectedCountry.iso2}/states`,
              {
                headers: { "X-CSCAPI-KEY": API_KEY },
              }
            );
            const dataRes = await res.json();
            setStates(
              dataRes.map((s) => ({ value: s.name, label: s.name, iso2: s.iso2 })) ||
              []
            );

            // Load cities if state is also preset
            if (formData.estado) {
              const selectedState = dataRes.find((s) => s.name === formData.estado);
              if (selectedState) {
                const citiesRes = await fetch(
                  `${BASE_URL}/countries/${selectedCountry.iso2}/states/${selectedState.iso2}/cities`,
                  {
                    headers: { "X-CSCAPI-KEY": API_KEY },
                  }
                );
                const citiesData = await citiesRes.json();
                setCities(citiesData.map((c) => ({ value: c.name, label: c.name })) || []);
              }
            }
          } catch (err) {
            setError("Error al cargar estados. Por favor intente más tarde.");
          }
        }
      }
    }
    loadStatesForPresetCountry();
  }, [mode, formData.pais, formData.estado, countries, localData]);

  const handleCountryChange = async (value) => {
    if (mode === "full") {
      setFormData((prev) => ({ ...prev, pais: value, estado: "", ciudad: "" }));
    }
    setStates([]);
    setCities([]);

    if (!value) return;

    // Si tenemos JSON local, obtener estados desde ahí
    if (localData) {
      const selected = localData.find(
        (c) => c.name_en === value || c.name_es === value
      );
      if (!selected) return;
      const localStates = (selected.states || []).map((s) => ({
        value: s.name_en || s.name_es || s.name,
        label: s.name_en || s.name_es || s.name,
        id: s.id,
      }));
      setStates(localStates);
      return;
    }

    // Fallback: llamar a la API remota
    const selectedCountry = countries.find((c) => c.value === value);
    if (!selectedCountry) return;

    try {
      const res = await fetch(
        `${BASE_URL}/countries/${selectedCountry.iso2}/states`,
        {
          headers: { "X-CSCAPI-KEY": API_KEY },
        }
      );
      const dataRes = await res.json();
      setStates(
        dataRes.map((s) => ({ value: s.name, label: s.name, iso2: s.iso2 })) ||
        []
      );
    } catch (err) {
      setError("Error al cargar estados. Por favor intente más tarde.");
    }
  };

  const handleStateChange = async (value) => {
    const currentCountry = mode === "full" ? formData.pais : data.pais;
    if (mode === "full") {
      setFormData((prev) => ({ ...prev, estado: value, ciudad: "" }));
    }
    setCities([]);

    if (!value || !currentCountry) return;

    // Si tenemos JSON local, obtener ciudades desde ahí
    if (localData) {
      const countryObj = localData.find(
        (c) => c.name_en === currentCountry || c.name_es === currentCountry
      );
      if (!countryObj) return;
      const stateObj = (countryObj.states || []).find(
        (s) => s.name_en === value || s.name_es === value
      );
      if (!stateObj) return;
      const localCities = (stateObj.cities || []).map((c) => ({
        value: c.name_en || c.name_es || c.name,
        label: c.name_en || c.name_es || c.name,
        id: c.id,
      }));
      setCities(localCities);
      return;
    }

    // Fallback: usar API remota
    const selectedCountry = countries.find((c) => c.value === currentCountry);
    if (!selectedCountry) return;

    const selectedState = states.find((s) => s.value === value);
    if (!selectedState) return;

    try {
      const res = await fetch(
        `${BASE_URL}/countries/${selectedCountry.iso2}/states/${selectedState.iso2}/cities`,
        {
          headers: { "X-CSCAPI-KEY": API_KEY },
        }
      );
      const dataRes = await res.json();
      setCities(dataRes.map((c) => ({ value: c.name, label: c.name })) || []);
    } catch (err) {
      setError("Error al cargar ciudades. Por favor intente más tarde.");
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
          setIsEditingPersonal(false);
          setPersonalForm({
            nombres: data.nombres || "",
            apellidoP: data.apellidoP || "",
            apellidoM: data.apellidoM || "",
            fechaNacimiento: formatDateForInput(data.fechaNacimiento) || "",
            licenciatura: data.licenciatura || "",
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
