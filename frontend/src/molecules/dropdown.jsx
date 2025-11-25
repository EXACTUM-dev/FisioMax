/**
 * @fileoverview Personalized dropdown component
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React, { useState, useRef, useEffect } from "react";

/**
 * Dropdown component
 * @param {Object} props - Component props.
 * @param {string} props.name - Field name.
 * @param {string} props.label - Field label.
 * @param {boolean} props.required - Whether field is required.
 * @param {string} props.value - Current value.
 * @param {Function} props.onChange - Change handler.
 * @param {Array<{value: string, label: string}>} props.options - Options array.
 * @param {string} props.placeholder - Placeholder text.
 * @param {string} props.error - Error message.
 * @returns {JSX.Element} Dropdown component.
 */

export default function Dropdown({
  name,
  label,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Detect key "esc"
      if (event.key === "Escape") {
        // Keep the focus on the main button
        const active = document.activeElement;
        if (!containerRef.current?.contains(active)) return;

        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="w-full" ref={containerRef}>
      <label className="text-sm font-semibold text-gray-700 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border rounded focus:outline-none cursor-pointer focus:ring-2 focus:ring-[#CAD00F] transition-colors ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span
            className={`${selectedOption ? "text-gray-900" : "text-gray-500"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    handleSelect(option.value);
                    buttonRef.current?.focus();
                  }
                }}
                className={`w-full px-3 py-2 text-left cursor-pointer hover:bg-gray-100 transition-colors ${
                  option.value === value
                    ? "bg-[#CAD00F]/10 text-gray-900 font-medium"
                    : "text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
