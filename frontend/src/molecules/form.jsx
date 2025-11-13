/**
 * @fileoverview FormField molecule component with character counter
 * @author EXACTUM-dev
 * @version: 1.0.0
 * @description Reusable form component with label, input, and optional character counter
 */
import React from "react";

/** FormLabel component for rendering the label of the form field
 * @param {Object} props - Component props
 * @param {string} props.htmlFor - The id of the input element this label is for
 * @param {React.ReactNode} props.children - The label text or elements
 * @param {boolean} props.required - Whether the field is required
 */

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

/** FormInput component for rendering the input or textarea element
 * @param {Object} props - Component props
 * @param {string} [props.type="text"] - The type of the input element
 * @param {string} props.id - The id of the input element
 * @param {string} props.name - The name of the input element
 * @param {string} props.value - The value of the input element
 */

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
  maxLength,
  disabled = false,
  required = false,
}) {
  const handleChange = onChange || (() => {});

  if (multiline) {
    return (
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#CAD00F] text-gray-900 resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
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
      onChange={handleChange}
      placeholder={placeholder}
      max={max}
      min={min}
      maxLength={maxLength}
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
  maxLength,
  disabled = false,
  showCounter = true,
}) {
  const currentLength = value?.length || 0;
  const shouldShowCounter = maxLength && showCounter && !disabled;

  return (
    <div className="flex flex-col items-start w-full mb-4">
      <FormLabel htmlFor={name} required={required}>
        {label}
      </FormLabel>
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
        maxLength={maxLength}
        disabled={disabled}
        required={required}
      />

      <div className="flex justify-between items-center w-full mt-1">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {shouldShowCounter && (
          <p
            className={`text-xs ${error ? "ml-auto" : ""} ${
              currentLength > maxLength ? "text-red-500" : "text-slate-500"
            }`}
          >
            {currentLength}/{maxLength} caracteres
          </p>
        )}
      </div>
    </div>
  );
}
