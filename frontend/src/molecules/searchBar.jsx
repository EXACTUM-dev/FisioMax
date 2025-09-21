/**
 * Version: 0.1.0
 * Search bar atom
 * Controlled input with embedded search icon.
 */
import React from "react";

/**
 * Props:
 * - value: string
 * - onChange: (value) => void
 * - placeholder?: string
 * - className?: string
 * - inputClassName?: string
 */
export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
}) {
  return (
    <div className={`relative w-full md:w-80 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
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
    </div>
  );
}
