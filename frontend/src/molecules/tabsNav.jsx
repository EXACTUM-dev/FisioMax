/**
 * Version: 0.1.0
 * Horizontal tabs atom
 * Accessible tablist with keyboard support (Left/Right, Home/End).
 */
import React, { useCallback } from "react";

/**
 * Props:
 * - items: [{ key: string, label: string }]
 * - activeKey: string
 * - onChange: (key) => void
 * - className?: string
 * - ariaLabel?: string
 */
export default function TabsNav({
  items = [],
  activeKey,
  onChange,
  className = "",
  ariaLabel = "Tabs",
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const keys = items.map((i) => i.key);
      const idx = Math.max(0, keys.indexOf(activeKey));
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % keys.length;
      if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + keys.length) % keys.length;
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = Math.max(0, keys.length - 1);
      const nextKey = keys[nextIdx];
      if (nextKey && nextKey !== activeKey) onChange?.(nextKey);
    },
    [items, activeKey, onChange]
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-6 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {items.map((it) => {
        const isActive = it.key === activeKey;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${it.key}`}
            id={`tab-${it.key}`}
            type="button"
            onClick={() => onChange?.(it.key)}
            className={`text-lg md:text-xl leading-none pb-1 border-b-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm cursor-pointer ${
              isActive
                ? "font-semibold text-slate-900 border-slate-300"
                : "font-medium text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
