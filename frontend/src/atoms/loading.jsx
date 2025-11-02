/**
 * @fileoverview Loading component with spinner and optional message
 * @version 0.4.0
 * @author EXACTUM-dev
 * @description Reusable loading indicator for different loading states
 */

import React from "react";

/**
 * Loading component with customizable spinner and message
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.fullscreen - If true, covers full viewport with background
 * @param {string} props.message - Text to display below spinner
 * @param {number} props.size - Spinner size in pixels
 * @param {string} props.className - Additional CSS classes
 * @returns {React.Element} Loading component
 */
export default function Loading({
  fullscreen = true,
  message = "Cargando...",
  size = 48,
  className = "",
}) {
  const wrapperClasses = fullscreen
    ? "min-h-screen bg-[#FAFAFA] flex items-center justify-center"
    : "py-8 flex items-center justify-center";

  return (
    <div className={`${wrapperClasses} ${className}`}>
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CAD00F] mx-auto"
          style={{ width: size, height: size }}
        />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
