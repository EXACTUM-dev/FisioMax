/**
 * @fileoverview Reusable check success icon with green circular background.
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import React from "react";

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