/**
 * @fileoverview Expandable search bar component with icon and keyboard support
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Controlled input that expands on click with embedded search icon and Enter key support
 */

import React, { useState, useRef, useEffect } from "react";

/**
 * SearchBar component with expandable functionality
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.value=""] - Current search value
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} [props.placeholder="Buscar..."] - Placeholder text
 * @param {string} [props.className=""] - Additional CSS classes for container
 * @param {string} [props.inputClassName=""] - Additional CSS classes for input
 * @param {Function} [props.onKeyDown] - Callback for keyboard events
 * @param {boolean} [props.expandable=true] - Whether the search bar is expandable
 * @returns {React.Element} SearchBar component
 */
export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Buscar...",
  className = "",
  inputClassName = "",
  onKeyDown,
  expandable = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  /**
   * Handles click outside to collapse search bar
   */
  useEffect(() => {
    if (!expandable) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !value
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, expandable]);

  function getTruncatedPlaceholder(placeholder, maxLength = 35) {
    if (placeholder.length > maxLength) {
      return placeholder.slice(0, maxLength - 3) + "...";
    }
    return placeholder;
  }

  /**
   * Handles search icon click
   */
  const handleIconClick = () => {
    if (!expandable) return;

    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /**
   * Handles clear button click
   */
  const handleClear = () => {
    onChange?.("");
    if (!expandable || value) {
      setIsExpanded(false);
    }
  };

  // Non-expandable version (always expanded)
  if (!expandable) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={getTruncatedPlaceholder(placeholder)}
          title={placeholder}
          className={`w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-[#CAD00F] transition-all ${inputClassName}`}
        />
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

  // Expandable version - expands to the left using absolute positioning
  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: "24px" }}
    >
      {/* Expandable container - positioned absolutely to the left */}
      <div
        className="absolute right-0 flex items-center transition-all duration-300 ease-in-out"
        style={{
          width: isExpanded ? "280px" : "24px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {/* Search icon button */}
        <button
          onClick={handleIconClick}
          className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg transition-colors duration-200 z-10 ${
            isExpanded
              ? "text-slate-400 pointer-events-none"
              : "text-slate-500 hover:text-slate-700"
          }`}
          style={{ width: "24px", height: "24px" }}
          aria-label="Abrir búsqueda"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </button>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={getTruncatedPlaceholder(placeholder)}
          title={placeholder}
          className={`w-full rounded-lg border bg-white text-sm outline-none transition-all duration-300 ${
            isExpanded
              ? "border-slate-300 focus:ring-2 focus:ring-[#CAD00F] opacity-100 pl-9 pr-10 py-1"
              : "border-transparent opacity-0 pointer-events-none p-0"
          } ${inputClassName}`}
          style={{
            height: "28px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        />

        {/* Clear button */}
        {isExpanded && value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            aria-label="Limpiar búsqueda"
          >
            <svg
              className="h-4 w-4"
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
    </div>
  );
}
