/**
 * Version: 0.1.0
 * Navigation arrow icon components
 * Includes iconic button and left and right arrow icons
 */
import React from "react";

// Icon button for navigation actions
export function IconButton({
  ariaLabel,
  onClick,
  children,
  className = "",
  style,
  disabled = false,
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-11 grid place-items-center rounded-full bg-gray-100 border border-gray-200 shadow-sm transition-transform duration-100 hover:bg-gray-50 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

// Left arrow icon
export function LeftArrowIcon({ size = 24, color = "#6b7280" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 19l-7-7 7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Right arrow icon
export function RightArrowIcon({ size = 24, color = "#6b7280" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 5l7 7-7 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Optional grouped export for compatibility
export const ArrowIcons = {
  IconButton,
  LeftArrowIcon,
  RightArrowIcon,
};

export default ArrowIcons;
