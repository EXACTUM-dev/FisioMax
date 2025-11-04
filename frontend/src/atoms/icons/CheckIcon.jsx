/**
 * @fileoverview Reusable check success icon with green circular background.
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import React from "react";

/**
 * CheckIcon component displaying a check mark inside a green circle.
 * @param {string} [props.className="h-16 w-16"] - CSS classes for sizing the icon.
 * @param {string} [props.title="Éxito"] - Accessible title for the icon.
 * @returns {JSX.Element} CheckIcon component
 */
export default function CheckIcon({ className = "h-16 w-16", title = "Éxito" }) {
  return (
    <div className={`${className} flex items-center justify-center`} role="img" aria-label={title}>
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ filter: 'none' }}
      >
        {/* Outer green circle */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="#22c55e" 
          strokeWidth="1.5" 
          fill="white" 
        />
        {/* Check mark */}
        <path
          d="M8 12.5l2.5 2.5 5.5-5.5"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}