import React from "react";

/**
 * @fileovervieweusable checkBox component
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Includes consistent styles and improved accessibility
 */

/**
 * Close button (X) component for modals and dialogs
 *
 * @param {Object} props - Component properties
 * @param {Function} props.onClose - Required callback function to handle close events
 * @param {string} props.className - Additional CSS classes for customization
 * @param {"sm"|"md"|"lg"} props.size - Button size variant (small, medium, large)
 * @param {Object} props.position - Positioning object with top, right, left, bottom properties
 * @param {string} props.position.top - Top positioning class (e.g., "top-3")
 * @param {string} props.position.right - Right positioning class (e.g., "right-3")
 * @param {string} props.position.left - Left positioning class (e.g., "left-3")
 * @param {string} props.position.bottom - Bottom positioning class (e.g., "bottom-3")
 * @param {string} props.ariaLabel - Accessible label for screen readers (default: "Cerrar modal")
 * @param {React.Ref} ref - Forwarded ref for the button element
 * @returns {React.Element} Close button component
 */
const CloseButton = (
  {
    onClose,
    className = "",
    size = "md",
    position = { top: "top-3", right: "right-3" },
    ariaLabel = "Cerrar modal",
  },
  ref
) => {
  // Size configuration mapping
  const sizeClasses = {
    sm: "w-6 h-6 text-base",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-xl",
  };

  // Base CSS classes for the button
  const baseClasses =
    "absolute flex items-center justify-center font-normal border-0 bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200 cursor-pointer z-60 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50";

  // Position classes derived from position prop
  const positionClasses = `${position.top || ""} ${position.right || ""} ${
    position.left || ""
  } ${position.bottom || ""}`;

  return (
    <button
      ref={ref}
      onClick={onClose}
      className={`${baseClasses} ${sizeClasses[size]} ${positionClasses} ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      x
    </button>
  );
};

export default CloseButton;