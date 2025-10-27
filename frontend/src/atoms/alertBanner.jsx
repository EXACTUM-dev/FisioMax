import React from "react";

/**
 * Simple, reusable alert banner with optional retry button.
 * type: "error" | "warning" | "info" | "success"
 */
export default function AlertBanner({
  type = "error",
  message = "",
  onRetry,
  className = "",
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };

  return (
    <div
      role="alert"
      className={`rounded-lg border p-3 ${styles[type]} ${className}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{message}</span>
        {onRetry && (
          <button
            type="button"
            className="ml-auto shrink-0 rounded bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-800"
            onClick={onRetry}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
