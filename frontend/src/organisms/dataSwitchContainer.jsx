/**
 * Version: 0.1.0
 * Switchable container with tabs and an optional search bar.
 * Uses TabsNav and SearchBar atoms.
 */
import React, { useMemo, useState } from "react";
import DataTable from "./dataTable";
import TabsNav from "../molecules/tabsNav";
import SearchBar from "../molecules/searchBar";

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
        <TabsNav
          items={views.map((v) => ({ key: v.key, label: v.label }))}
          activeKey={activeKey}
          onChange={setActiveKey}
          ariaLabel="Data views"
        />
        {searchEnabled && (
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={activeView.searchPlaceholder ?? "Search..."}
          />
        )}
      </div>

      {/* Body: rounded container */}
      <div
        id={`panel-${activeKey}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeKey}`}
        className="rounded-[18px] border border-slate-200 bg-white p-4 md:p-6"
      >
        {activeView.type === "table" ? (
          <DataTable columns={activeView.columns ?? []} data={filteredRows} />
        ) : typeof activeView.render === "function" ? (
          activeView.render({ query })
        ) : null}
      </div>
    </section>
  );
}
