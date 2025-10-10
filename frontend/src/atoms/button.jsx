/**
 * Version: 1.2.0
 * Generic button atom
 * Reusable, accessible and brand-ready button.
 * Notes: uses Tailwind and the extended "brand" color (#CAD00F).
 */
import React from "react";

/**
 * Props:
 * - label?: string (default "SOMEFIPP")
 * - children?: React.ReactNode (overrides label if present)
 * - variant?: "brand" | "outline" | "ghost"
 * - size?: "xs" | "sm" | "md" | "lg" | "xl"  // more compact scale
 * - fullWidth?: boolean
 * - type?: "button" | "submit" | "reset"
 * - disabled?: boolean
 * - onClick?: () => void
 * - className?: string
 * - ariaLabel?: string
 * - radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" (default "xl")
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

  const variants = {
    brand:
      "bg-brand text-stone-700 hover:brightness-95 focus-visible:ring-brand/60",
    outline:
      "bg-transparent text-brand border border-brand hover:bg-brand/10 focus-visible:ring-brand/50",
    ghost:
      "bg-transparent text-brand hover:bg-brand/10 focus-visible:ring-brand/40",
  };
  const variantCls = variants[variant] ?? variants.brand;

  const radii = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };
  const radiusCls = radii[radius] ?? radii.xl;

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
