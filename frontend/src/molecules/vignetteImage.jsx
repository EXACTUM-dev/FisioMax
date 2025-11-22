/**
 * @fileoverview Image component with optional overlay effect
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Displays an image with fallback handling and optional overlay container for children
 */

import React from "react";

/**
 * VignetteImage component with fallback support and content overlay
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for image
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {Object} [props.style] - Inline styles for the container
 * @param {string} [props.variant] - Reserved for future vignette effects (currently unused)
 * @param {React.ReactNode} [props.children] - Child elements to overlay on the image
 * @returns {React.Element} VignetteImage component
 */
export default function VignetteImage({
  src,
  alt,
  className = "",
  style = {},
  variant,
  children,
}) {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/SOMEFIPP-Logo.jpeg";
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      {/* Image with object-cover to fill container */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={handleImageError}
        loading="lazy"
      />

      {/* Content overlay - positioned at bottom with proper padding */}
      {children && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      )}
    </div>
  );
}
