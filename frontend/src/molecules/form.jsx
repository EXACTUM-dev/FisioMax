/**
 * @fileoverview FormField molecule component
 * @author EXACTUM-dev
 * @version: 0.3.0
 * @description Reusable form component with label and input
 */
import React from "react";

function FormLabel({ htmlFor, children, required }) {
  return (
    <label
      className="text-sm font-semibold text-gray-700 mb-1"
      htmlFor={htmlFor}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function FormInput({
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 1,
  max,
  min,
  disabled = false,
  required = false,
}) {
  const handleChange = onChange || (() => {});

  if (multiline) {
    // Render multiline if the field is specified to
    return (
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#CAD00F] text-gray-900 resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
      />
    );
  }
  return (
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#CAD00F] text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      max={max}
      min={min}
      disabled={disabled}
      required={required}
      autoComplete="off"
    />
  );
}

export default function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  name = "",
  required = false,
  error = "",
  multiline = false,
  rows = 3,
  max,
  min,
  disabled = false,
}) {
  return (
    // Main container with label and input
    <div className="flex flex-col items-start w-full mb-4">
      {/* Label at the top left */}
      <FormLabel htmlFor={name} required={required}>
        {label}
      </FormLabel>
      {/* Input at the bottom */}
      <FormInput
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        max={max}
        min={min}
        disabled={disabled}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
