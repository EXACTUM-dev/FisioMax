/**
 * @fileoverview Address card component for displaying user address information.
 * Shows country, state, city, and detailed address fields.
 * @version 0.2.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import Dropdown from "../molecules/dropdown";
import FormField from "../molecules/form";
import SuccessErrorModal from "./successErrorModal";
import Modal from "../molecules/modal";
import { FIELD_MAX_LENGTHS } from "../utils/profileFormValidation";
import { Country, State, City } from "country-state-city";

/**
 * Truncates text to a maximum number of characters
 * @param {string} text - Text to truncate
 * @param {number} maxChars - Maximum number of characters
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateText(text = "", maxChars = 25) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * AddressCard component for displaying and editing user address information.
 * Uses country-state-city library for dynamic dropdowns.
 */
export default function AddressCard({
  data = {},
  canEdit = false,
  onSave,
  onEditChange,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Notify parent when editing state changes
  useEffect(() => {
    if (onEditChange) {
      onEditChange(isEditing);
    }
  }, [isEditing, onEditChange]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Editable form state
  const [form, setForm] = useState({
    pais: data.pais || "",
    estado: data.estado || "",
    ciudad: data.ciudad || "",
    colonia: data.colonia || "",
    codigoPostal: data.codigoPostal || "",
    calle: data.calle || "",
    numExterior: data.numExterior || "",
    numInterior: data.numInterior || "",
  });

  // Dropdown options
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Reset form when data changes
  useEffect(() => {
    setForm({
      pais: data.pais || "",
      estado: data.estado || "",
      ciudad: data.ciudad || "",
      colonia: data.colonia || "",
      codigoPostal: data.codigoPostal || "",
      calle: data.calle || "",
      numExterior: data.numExterior || "",
      numInterior: data.numInterior || "",
    });
  }, [data]);

  // Load countries on mount
  useEffect(() => {
    setCountries(
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
      }))
    );
  }, []);

  // When editing starts, convert country/state names to isoCode if needed
  useEffect(() => {
    if (isEditing) {
      let countryIso = form.pais;
      let stateIso = form.estado;
      let cityName = form.ciudad;

      // Convert country name to isoCode if necessary
      if (countryIso && countryIso.length !== 2) {
        const foundCountry = Country.getAllCountries().find(
          (c) => c.name === countryIso
        );
        countryIso = foundCountry ? foundCountry.isoCode : "";
      }
      // Convert state name to isoCode if necessary
      if (stateIso && stateIso.length !== 2 && countryIso) {
        const foundState = State.getStatesOfCountry(countryIso).find(
          (s) => s.name === stateIso
        );
        stateIso = foundState ? foundState.isoCode : "";
      }

      setForm((prev) => ({
        ...prev,
        pais: countryIso || "",
        estado: stateIso || "",
        ciudad: cityName || "",
      }));

      // Load states and cities for selected country/state
      setStates(
        State.getStatesOfCountry(countryIso).map((s) => ({
          value: s.isoCode,
          label: s.name,
        }))
      );
      setCities(
        City.getCitiesOfState(countryIso, stateIso).map((c) => ({
          value: c.name,
          label: c.name,
        }))
      );
    }
  }, [isEditing]);

  // Load states when country changes in edit mode
  useEffect(() => {
    if (isEditing && form.pais) {
      setStates(
        State.getStatesOfCountry(form.pais).map((s) => ({
          value: s.isoCode,
          label: s.name,
        }))
      );
      setCities([]);
    }
  }, [isEditing, form.pais]);

  // Load cities when state changes in edit mode
  useEffect(() => {
    if (isEditing && form.pais && form.estado) {
      setCities(
        City.getCitiesOfState(form.pais, form.estado).map((c) => ({
          value: c.name,
          label: c.name,
        }))
      );
    }
  }, [isEditing, form.pais, form.estado]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Handle country change in dropdown
  const handlePaisChange = (value) => {
    setForm((prev) => ({ ...prev, pais: value, estado: "", ciudad: "" }));
    setStates([]);
    setCities([]);
  };

  // Handle state change in dropdown
  const handleEstadoChange = (value) => {
    setForm((prev) => ({ ...prev, estado: value, ciudad: "" }));
    setCities([]);
  };

  // Validate required address fields
  const validateAddress = () => {
    const missingFields = [];
    if (!form.pais || form.pais.trim() === "") {
      missingFields.push("País");
    }
    if (!form.estado || form.estado.trim() === "") {
      missingFields.push("Estado / Provincia");
    }

    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }
    return true;
  };

  // Save address changes after validation
  async function handleSave() {
    if (!onSave) return;
    if (!validateAddress()) {
      return;
    }
    try {
      await onSave({
        pais: form.pais,
        estado: form.estado,
        ciudad: form.ciudad,
        colonia: form.colonia,
        codigoPostal: form.codigoPostal,
        calle: form.calle,
        numExterior: form.numExterior,
        numInterior: form.numInterior,
      });
      setIsEditing(false);
      setModalType("success");
      setModalMessage("La dirección se ha actualizado exitosamente.");
      setShowModal(true);
    } catch (error) {
      console.error("Error saving address:", error);
      setModalType("error");
      setModalMessage(
        error.message ||
          "Error al guardar la dirección. Por favor, intente nuevamente."
      );
      setShowModal(true);
    }
  }

  // Get country name from isoCode for display
  const getCountryName = (isoCode) => {
    const found = Country.getAllCountries().find((c) => c.isoCode === isoCode);
    return found ? found.name : isoCode || "No disponible";
  };

  // Get state name from isoCode for display
  const getStateName = (countryIso, stateIso) => {
    const found = State.getStatesOfCountry(countryIso).find(
      (s) => s.isoCode === stateIso
    );
    return found ? found.name : stateIso || "No disponible";
  };

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Datos de domicilio</h3>
        {canEdit && (
          <EditButton
            isEditing={isEditing}
            onClick={() => setIsEditing((v) => !v)}
            editLabel="Editar"
            cancelLabel="Cancelar"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {isEditing ? (
          <>
            {/* Country dropdown */}
            <Dropdown
              label="País"
              name="pais"
              value={form.pais}
              onChange={(e) => handlePaisChange(e.target.value)}
              options={countries}
              required={true}
              placeholder="Selecciona un país"
            />
            {/* State dropdown */}
            <Dropdown
              label="Estado / Provincia"
              name="estado"
              value={form.estado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              options={states}
              required={true}
              placeholder="Selecciona un estado"
            />
            {/* City dropdown */}
            <Dropdown
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              options={cities}
              placeholder="Selecciona una ciudad"
            />
          </>
        ) : (
          <>
            {/* Country display */}
            <div>
              <label className="text-sm text-slate-600">
                País
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900" title={data.pais || ""}>
                {getCountryName(data.pais) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            {/* State display */}
            <div>
              <label className="text-sm text-slate-600">
                Estado/Provincia
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900" title={data.estado || ""}>
                {getStateName(data.pais, data.estado) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            {/* City display */}
            <div>
              <label className="text-sm text-slate-600">Ciudad</label>
              <div className="mt-1 text-slate-900" title={data.ciudad || ""}>
                {truncateText(data.ciudad, 25) || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Other address fields */}
        {isEditing ? (
          <FormField
            label="Colonia"
            name="colonia"
            value={form.colonia}
            onChange={handleChange}
            maxLength={FIELD_MAX_LENGTHS.colonia}
          />
        ) : (
          <div>
            <label className="text-sm text-slate-600">Colonia</label>
            <div className="mt-1 text-slate-900" title={data.colonia || ""}>
              {truncateText(data.colonia, 25) || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        )}

        {isEditing ? (
          <FormField
            label="Código Postal"
            name="codigoPostal"
            value={form.codigoPostal}
            onChange={handleChange}
            maxLength={FIELD_MAX_LENGTHS.codigoPostal}
          />
        ) : (
          <div>
            <label className="text-sm text-slate-600">Código Postal</label>
            <div
              className="mt-1 text-slate-900"
              title={data.codigoPostal || ""}
            >
              {truncateText(data.codigoPostal, 25) || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        )}

        {isEditing ? (
          <FormField
            label="Calle"
            name="calle"
            value={form.calle}
            onChange={handleChange}
            maxLength={FIELD_MAX_LENGTHS.calle}
          />
        ) : (
          <div>
            <label className="text-sm text-slate-600">Calle</label>
            <div className="mt-1 text-slate-900" title={data.calle || ""}>
              {truncateText(data.calle, 25) || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        )}

        {isEditing ? (
          <FormField
            label="Número Exterior"
            name="numExterior"
            value={form.numExterior}
            onChange={handleChange}
            maxLength={FIELD_MAX_LENGTHS.numExterior}
          />
        ) : (
          <div>
            <label className="text-sm text-slate-600">Número Exterior</label>
            <div className="mt-1 text-slate-900" title={data.numExterior || ""}>
              {truncateText(data.numExterior, 25) || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        )}

        {isEditing ? (
          <FormField
            label="Número Interior"
            name="numInterior"
            value={form.numInterior}
            onChange={handleChange}
            maxLength={FIELD_MAX_LENGTHS.numInterior}
          />
        ) : (
          <div>
            <label className="text-sm text-slate-600">Número Interior</label>
            <div className="mt-1 text-slate-900" title={data.numInterior || ""}>
              {truncateText(data.numInterior, 25) || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        )}
      </div>
      {isEditing && (
        <div className="mt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              // Restore original values
              setForm({
                pais: data.pais || "",
                estado: data.estado || "",
                ciudad: data.ciudad || "",
                colonia: data.colonia || "",
                codigoPostal: data.codigoPostal || "",
                calle: data.calle || "",
                numExterior: data.numExterior || "",
                numInterior: data.numInterior || "",
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

      {/* Validation Modal for Required Fields */}
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
            Por favor completa los siguientes campos obligatorios antes de
            guardar:
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
    </section>
  );
}
