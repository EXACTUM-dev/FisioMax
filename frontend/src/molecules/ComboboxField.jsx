/**
 * @fileoverview Combobox field component reusing Dropdown for options rendering.
 * @author EXACTUM-dev
 * @version 1.1.0
 * @description Allows filtering and selecting options with consistent dropdown behavior.
 */

import React, { useState, useEffect, useRef } from "react";
import Dropdown from "./Dropdown";

/**
 * Combobox field component for dropdown with custom input option.
 * @param {Object} props - Component props.
 * @param {string} props.label - Field label.
 * @param {string} props.name - Field name.
 * @param {string} props.value - Current value.
 * @param {Function} props.onChange - Change handler.
 * @param {Array<string>} props.options - Options array.
 * @param {boolean} props.required - Whether field is required.
 * @param {string} props.error - Error message.
 * @param {string} props.placeholder - Placeholder text.
 * @returns {JSX.Element} Combobox field component.
 */
export default function ComboboxField({ label, name, value, onChange, options, required, error, placeholder }){
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      const handleKeyDown = (event) => {
        // Detect key "esc"
        if (event.key === "Escape") {
          setIsOpen(false);
  
          // Keep the focus on the main button
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Call parent onChange
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue
      }
    };
    onChange(syntheticEvent);
  };

  const handleOptionSelect = (option) => {
    setInputValue(option);
    setIsOpen(false);
    
    // Call parent onChange
    const syntheticEvent = {
      target: {
        name: name,
        value: option
      }
    };
    onChange(syntheticEvent);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };
  const handleInputBlur = (e) => {
    setTimeout(() => {
    if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement)) {
            setIsOpen(false);
        }
    }, 150);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
            if (e.key === "Tab" && isOpen && filteredOptions.length > 0) {
                e.preventDefault();
                if (optionRefs.current[0]) {
                    optionRefs.current[0].focus();
                }
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent bg-white text-gray-900"
        />
        <button
          ref={buttonRef}
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div ref={dropdownRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                tabIndex={0}
                key={index}
                type="button"
                ref={(el) => (optionRefs.current[index] = el)}
                onClick={() => handleOptionSelect(option)}
                onKeyDown={(e) => {
                    // If push TAB in an option
                    if (e.key === "Tab") {
                    e.preventDefault();

                    if (e.shiftKey) {
                        // Navegate backward
                        if (index > 0) {
                        optionRefs.current[index - 1].focus();
                        } else {
                        // Return to input
                        e.target.blur();
                        document.querySelector(`input[name="${name}"]`)?.focus();
                        }
                    } else {
                        // Navegate forward
                        if (index < filteredOptions.length - 1) {
                        optionRefs.current[index + 1].focus();
                        } else {
                        // If you are in the last option, close options and return to the input
                        setIsOpen(false);
                        e.target.blur();
                        document.querySelector(`input[name="${name}"]`)?.focus();
                        }
                    }
                    }
                    // 🔹 Cerrar con ESC
                    if (e.key === "Escape") {
                    setIsOpen(false);
                    document.querySelector(`input[name="${name}"]`)?.focus();
                    }
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No se encontraron opciones
            </div>
          )}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
