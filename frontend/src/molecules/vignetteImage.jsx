/**
 * @fileoverview VignetteImage component for displaying images with a vignette effect
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Image component that applies a vignette overlay for better visual integration
 */
import React from "react";

export default function VignetteImage({
  src,
  alt,
  variant = "full",
  className = "",
  style,
  children,
  cover = false,
  onError,
}) {
  // Gradient configuration based on selected variant
  const background =
    variant === "full"
      ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 85%, rgba(0,0,0,0.55) 100%)"
      : variant === "left"
      ? "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0) 50%)"
      : variant === "right"
      ? "linear-gradient(270deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0) 50%)"
      : "transparent";

  return (
    <div
      className={className}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Main image with cover options */}
      <img
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          height: cover ? "100%" : "auto",
          objectFit: cover ? "cover" : "initial",
        }}
        onError={onError}
      />
      {/* Vignette layer with gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background,
          zIndex: 10, // vignette stays below buttons
        }}
      />
      {/* Container for child elements (buttons, etc.) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            pointerEvents: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
