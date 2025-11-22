/**
 * @fileoverview Static search bar component (always visible, non-expandable)
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Search input that remains always visible with embedded search icon
 */

import React from "react";

/**
 * SearchBarStatic component - always visible search bar
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.value=""] - Current search value
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} [props.placeholder="Buscar..."] - Placeholder text
 * @param {string} [props.className=""] - Additional CSS classes for container
 * @param {string} [props.inputClassName=""] - Additional CSS classes for input
 * @param {Function} [props.onKeyDown] - Callback for keyboard events
 * @returns {React.Element} SearchBarStatic component
 */
export default function SearchBarStatic({
  value = "",
  onChange,
  placeholder = "Buscar...",
  className = "",
  inputClassName = "",
  onKeyDown,
}) {
  /**
   * Truncates placeholder if too long
   */
  function getTruncatedPlaceholder(placeholder, maxLength = 35) {
    if (placeholder.length > maxLength) {
      return placeholder.slice(0, maxLength - 3) + "...";
    }
    return placeholder;
  }

  /**
   * Handles clear button click
   */
  const handleClear = () => {
    onChange?.("");
  };

  return (
    <div className={`relative w-full md:w-80 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={getTruncatedPlaceholder(placeholder)}
        title={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-[#CAD00F] transition-all ${inputClassName}`}
      />

      {/* Search icon */}
      <svg
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
