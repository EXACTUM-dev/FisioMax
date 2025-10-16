/**
 * @fileoverview Reusable checkBox component. Includes consistent styles and improved accessibility
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import React from "react";

/**
 * Checkbox component properties.
 * @typedef {Object} CheckboxProps
 * @property {boolean} checked - Whether the checkbox is checked.
 * @property {function} onChange - Callback function when checkbox state changes.
 * @property {string} ariaLabel - Accessibility label for screen readers.
 * @property {string} [className] - Additional CSS classes to apply.
 * @property {Object} [props] - Additional input properties.
 * @returns {React.Element} Checkbox component
 */
export default function Checkbox({
  checked,
  onChange,
  ariaLabel,
  className = "",
  ...props
}) {
  return (
    <input
      type="checkbox"
      aria-label={ariaLabel}
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-blue-500 focus:ring-2 outline-none ${className}`}
      {...props}
    />
  );
}
