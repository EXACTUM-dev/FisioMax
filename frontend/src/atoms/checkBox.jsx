/**
 * Version: 0.1.0
 * Reusable checkBox component
 * Includes consistent styles and improved accessibility
 */
import React from "react";

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
