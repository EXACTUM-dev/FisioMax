/**
 * Author: Exactum
 * Version: 1.2.0
 * Generic button atom
 * Reusable, accessible and brand-ready button.
 * Notes: uses Tailwind and the extended "brand" color (#CAD00F).
 */

import React from "react";

/**
 * Generic button atom component
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.label="SOMEFIPP"] - Button text label
 * @param {React.ReactNode} [props.children] - Button content (overrides label if present)
 * @param {"brand"|"secondary"|"outline"|"ghost"} [props.variant="brand"] - Button style variant
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} [props.size="md"] - Button size with compact scale
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {"button"|"submit"|"reset"} [props.type="button"] - HTML button type
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {Function} [props.onClick] - Click event handler
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {string} [props.ariaLabel] - Accessible label for screen readers
 * @param {"sm"|"md"|"lg"|"xl"|"2xl"|"full"} [props.radius="xl"] - Border radius size
 * @returns {React.Element} Button component
 */
export default function Button({
  label = "SOMEFIPP",
  children,
  variant = "brand",
  size = "md", // default is smaller than before
  fullWidth = false,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ariaLabel,
  radius = "xl",
}) {
  // Compact size scale (reduced vertical padding)
  const sizes = {
    xs: "px-3 py-1.5 text-sm",
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-base",
    xl: "px-7 py-3.5 text-lg",
  };
  const sizeCls = sizes[size] ?? sizes.md;

  // Button style variants using brand color
  const variants = {
    brand:
      "bg-brand text-stone-700 hover:brightness-95 focus-visible:ring-brand/60",
    secondary:
      "bg-brand text-gray-800 hover:bg-[#b8bc0d] shadow-sm hover:shadow-md focus-visible:ring-brand/60 active:scale-95",
    outline:
      "bg-transparent text-black border border-brand hover:bg-brand/10 focus-visible:ring-brand/50",
    ghost:
      "bg-transparent text-brand hover:bg-brand/10 focus-visible:ring-brand/40",
    newDoc:
      "bg-tra text-black hover:bg-brand/10 focus-visible:ring-brand/40",
    cancel:
      "bg-cancel text-white hover:bg-brand/10 focus-visible:ring-[#5C5C5A]/60",
    gray:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400",
  };
  const variantCls = variants[variant] ?? variants.brand;

  // Border radius options
  const radii = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };
  const radiusCls = radii[radius] ?? radii.xl;

  // Base button styles
  const base =
    "inline-flex items-center justify-center font-semibold " +
    "shadow-sm transition-[transform,filter] cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={`${base} ${variantCls} ${radiusCls} ${sizeCls} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children ?? label}
    </button>
  );
}