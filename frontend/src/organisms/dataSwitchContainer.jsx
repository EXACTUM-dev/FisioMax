/**
 * Version: 1.0.0
 * Switchable container with tabs and an optional search bar.
 * Can render generic tables (DataTable) or custom content per view.
 */
import React, { useMemo, useState } from "react";
import DataTable from "./dataTable";

export default function DataSwitchContainer({
  views = [], // [{ key, label, type: 'table'|'custom', columns?, rows?, render?, searchPlaceholder?, searchEnabled? }]
  initialKey, // key of the initial active view
  className = "",
}) {
  const [activeKey, setActiveKey] = useState(initialKey ?? views[0]?.key);
  const [query, setQuery] = useState("");

  const activeView = views.find((v) => v.key === activeKey) ?? views[0] ?? {};

  // Determine if search should be shown
  const searchEnabled =
    activeView.searchEnabled ?? (activeView.type === "table" ? true : false);

  // Filter rows for table-type views
  const filteredRows = useMemo(() => {
    if (activeView.type !== "table") return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeView.rows ?? [];
    const cols = (activeView.columns ?? []).filter(
      (c) => c.searchable !== false
    );
    const rows = activeView.rows ?? [];
    return rows.filter((r) =>
      cols.some((c) => {
        const value =
          typeof c.searchAccessor === "function"
            ? c.searchAccessor(r)
            : r?.[c.key];
        return String(value ?? "")
          .toLowerCase()
          .includes(q);
      })
    );
  }, [activeView, query]);

  return (
    <section className={`max-w-[70rem] mx-auto ${className}`}>
      {/* Header: tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          {views.map((v) => {
            const isActive = v.key === activeKey;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => setActiveKey(v.key)}
                className={`text-lg md:text-xl leading-none pb-1 border-b-2 transition-colors ${
                  isActive
                    ? "font-semibold text-slate-900 border-slate-300"
                    : "font-medium text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        {searchEnabled && (
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeView.searchPlaceholder ?? "Search..."}
              className="w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Body: rounded container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        {activeView.type === "table" ? (
          <DataTable columns={activeView.columns ?? []} data={filteredRows} />
        ) : typeof activeView.render === "function" ? (
          activeView.render({ query })
        ) : null}
      </div>
    </section>
  );
}
