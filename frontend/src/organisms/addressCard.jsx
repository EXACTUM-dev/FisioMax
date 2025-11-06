/**
 * @fileoverview Address card component for displaying user address information.
 * Shows country, state, city, and detailed address fields.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import EditButton from "../atoms/editButton";
import Button from "../atoms/button";
import Dropdown from "../molecules/dropdown";
import SuccessErrorModal from "./successErrorModal";
import Modal from "../molecules/modal";

// Variables for country, state and city APIs
const COUNTRIES_API_BASE_URL = import.meta.env.VITE_COUNTRIES_API_BASE_URL;
const COUNTRIES_POSITIONS_ENDPOINT = import.meta.env
  .VITE_COUNTRIES_POSITIONS_ENDPOINT;
const COUNTRIES_STATES_ENDPOINT = import.meta.env.VITE_COUNTRIES_STATES_ENDPOINT;
const COUNTRIES_CITIES_ENDPOINT = import.meta.env.VITE_COUNTRIES_CITIES_ENDPOINT;

/**
 * Displays user address card with editable fields for country, state, city, and address details.
 * Supports dynamic loading of states and cities based on country selection.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User address data containing pais, estado, ciudad, colonia, codigoPostal, calle, numExterior, and numInterior.
 * @param {boolean} [props.canEdit=false] - Whether editing is allowed.
 * @param {Function} [props.onSave] - Callback function to save address changes.
 * @return {!JSX.Element} Address card component.
 */
export default function AddressCard({ data = {}, canEdit = false, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
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

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          `${COUNTRIES_API_BASE_URL}${COUNTRIES_POSITIONS_ENDPOINT}`
        );
        const data = await res.json();
        const formatted = data.data
          .map((c) => ({ value: c.name, label: c.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(formatted);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Load states and cities when editing starts and data exists
  useEffect(() => {
    if (isEditing && form.pais) {
      const loadInitialData = async () => {
        try {
          // Load states
          const statesRes = await fetch(
            `${COUNTRIES_API_BASE_URL}${COUNTRIES_STATES_ENDPOINT}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ country: form.pais }),
            }
          );
          const statesData = await statesRes.json();
          const formattedStates =
            statesData.data?.states?.map((s) => ({
              value: s.name,
              label: s.name,
            })) || [];
          setStates(formattedStates);

          // If we have a state, load cities
          const currentEstado = form.estado;
          if (currentEstado) {
            const citiesRes = await fetch(
              `${COUNTRIES_API_BASE_URL}${COUNTRIES_CITIES_ENDPOINT}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  country: form.pais,
                  state: currentEstado,
                }),
              }
            );
            const citiesData = await citiesRes.json();
            const formattedCities =
              citiesData.data?.map((c) => ({ value: c, label: c })) || [];
            setCities(formattedCities);
          }
        } catch (err) {}
      };
      loadInitialData();
    } else if (!isEditing) {
      // Reset dropdowns when closing edit mode
      setStates([]);
      setCities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  /**
   * Handles input field changes and updates form state.
   * @param {!Event} e - Input change event.
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Handles country selection and fetches states for that country.
   * Resets state and city fields when country changes.
   * @param {string} value - Selected country name.
   * @return {!Promise<void>}
   */
  const handlePaisChange = async (value) => {
    setForm((prev) => ({ ...prev, pais: value, estado: "", ciudad: "" }));
    setStates([]);
    setCities([]);

    if (!value) return;

    try {
      const res = await fetch(
        `${COUNTRIES_API_BASE_URL}${COUNTRIES_STATES_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: value }),
        }
      );
      const data = await res.json();
      const formattedStates =
        data.data?.states?.map((s) => ({ value: s.name, label: s.name })) || [];
      setStates(formattedStates);

      // If we have a state value, load cities
      if (form.estado) {
        handleEstadoChange(form.estado, value);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
      setStates([]);
    }
  };

  /**
   * Handles state selection and fetches cities for that state.
   * Resets city field when state changes.
   * @param {string} value - Selected state name.
   * @param {string} [country=form.pais] - Country name for API request.
   * @return {!Promise<void>}
   */
  const handleEstadoChange = async (value, country = form.pais) => {
    setForm((prev) => ({ ...prev, estado: value, ciudad: "" }));
    setCities([]);

    if (!value || !country) return;

    try {
      const res = await fetch(
        `${COUNTRIES_API_BASE_URL}${COUNTRIES_CITIES_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country, state: value }),
        }
      );
      const data = await res.json();
      const formattedCities =
        data.data?.map((c) => ({ value: c, label: c })) || [];
      setCities(formattedCities);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setCities([]);
    }
  };

  /**
   * Validates required fields for address (pais, estado, ciudad).
   * Shows validation modal with missing fields if validation fails.
   * @return {boolean} True if valid, false otherwise.
   */
  const validateAddress = () => {
    const missingFields = [];

    if (!form.pais || form.pais.trim() === "") {
      missingFields.push("País");
    }
    if (!form.estado || form.estado.trim() === "") {
      missingFields.push("Estado / Provincia");
    }
    if (!form.ciudad || form.ciudad.trim() === "") {
      missingFields.push("Ciudad");
    }

    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowValidationModal(true);
      return false;
    }

    return true;
  };

  /**
   * Handles saving address changes after validation.
   * Calls onSave callback with form data and shows success/error modal.
   * @return {!Promise<void>}
   */
  async function handleSave() {
    if (!onSave) return;

    // Validate required fields
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

      // Show success modal
      setModalType("success");
      setModalMessage("La dirección se ha actualizado exitosamente.");
      setShowModal(true);
    } catch (error) {
      console.error("Error saving address:", error);
      // Show error modal
      setModalType("error");
      setModalMessage(
        error.message ||
          "Error al guardar la dirección. Por favor, intente nuevamente."
      );
      setShowModal(true);
    }
  }
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
            <Dropdown
              label="País"
              name="pais"
              value={form.pais}
              onChange={(e) => handlePaisChange(e.target.value)}
              options={countries}
              required={true}
              placeholder="Selecciona un país"
            />
            <Dropdown
              label="Estado / Provincia"
              name="estado"
              value={form.estado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              options={states}
              required={true}
              placeholder="Selecciona un estado"
            />
            <Dropdown
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              options={cities}
              required={true}
              placeholder="Selecciona una ciudad"
            />
          </>
        ) : (
          <>
            <div>
              <label className="text-sm text-slate-600">
                País
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900">
                {data.pais || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Estado/Provincia
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900">
                {data.estado || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Ciudad
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 text-slate-900">
                {data.ciudad || (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-sm text-slate-600">Colonia</label>
          {isEditing ? (
            <input
              name="colonia"
              value={form.colonia}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.colonia || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Código Postal</label>
          {isEditing ? (
            <input
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.codigoPostal || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Calle</label>
          {isEditing ? (
            <input
              name="calle"
              value={form.calle}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.calle || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Exterior</label>
          {isEditing ? (
            <input
              name="numExterior"
              value={form.numExterior}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.numExterior || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-600">Número Interior</label>
          {isEditing ? (
            <input
              name="numInterior"
              value={form.numInterior}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
            />
          ) : (
            <div className="mt-1 text-slate-900">
              {data.numInterior || (
                <span className="text-slate-400">No disponible</span>
              )}
            </div>
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
