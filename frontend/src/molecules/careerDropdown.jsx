/**
 * @fileoverview Career/License dropdown with conditional custom input
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from "react";
import Dropdown from "./dropdown";
import { CAREER_OPTIONS } from "../utils/profileFormValidation";

export default function CareerDropdown({
  label = "Licenciatura",
  name = "licenciatura",
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}) {
  const [showCustomCareer, setShowCustomCareer] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [customCareer, setCustomCareer] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Solo ejecutar si no está inicializado o si el valor cambió externamente
    if (!isInitialized || (!showCustomCareer && value !== selectedCareer)) {
      if (CAREER_OPTIONS.slice(0, -1).includes(value)) {
        setSelectedCareer(value);
        setShowCustomCareer(false);
      } else if (value) {
        setSelectedCareer("Otra");
        setCustomCareer(value);
        setShowCustomCareer(true);
      } else {
        setSelectedCareer("");
        setCustomCareer("");
        setShowCustomCareer(false);
      }
      setIsInitialized(true);
    }
  }, [value]);

  const handleCareerChange = (e) => {
    const newValue = e.target.value;
    setSelectedCareer(newValue);

    if (newValue === "Otra") {
      setShowCustomCareer(true);
      setCustomCareer("");
    } else {
      setShowCustomCareer(false);
      setCustomCareer("");
      onChange({ target: { name, value: newValue } });
    }
  };

  const handleCustomCareerChange = (e) => {
    const newValue = e.target.value;
    setCustomCareer(newValue);
    onChange({ target: { name, value: newValue } });
  };

  // Read-only mode
  if (disabled) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          {label}
        </label>
        <div className="mt-1 text-slate-900">
          {value || <span className="text-slate-400">No disponible</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={showCustomCareer ? "space-y-3" : ""}>
      <Dropdown
        label={label}
        name={`${name}_dropdown`}
        value={selectedCareer}
        onChange={handleCareerChange}
        options={CAREER_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
        placeholder="Selecciona una opción"
        error={!showCustomCareer ? error : null}
        required={required}
      />

      {showCustomCareer && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especifica tu licenciatura
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            name={name}
            value={customCareer}
            onChange={handleCustomCareerChange}
            placeholder="Escribe tu licenciatura"
            maxLength={100}
            required={required}
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent bg-white text-gray-900"
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
