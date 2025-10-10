/**
 * Version: 0.2.0
 * Switchable container with tabs and an optional search bar.
 * Uses TabsNav and SearchBar atoms.
 * FIX: Agregado soporte para mensaje cuando no hay datos
 */
import React, { useMemo, useState } from "react";
import DataTable from "./dataTable";
import TabsNav from "../molecules/tabsNav";
import SearchBar from "../molecules/searchBar";

export default function DataSwitchContainer({
  views = [], // [{ key, label, type: 'table'|'custom', columns?, rows?, render?, searchPlaceholder?, searchEnabled?, emptyMessage? }]
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

  const showEmptyMessage = activeView.type === "table" && 
    (!activeView.rows || activeView.rows.length === 0);
  
  const showNoResultsMessage = activeView.type === "table" && 
    activeView.rows && 
    activeView.rows.length > 0 && 
    filteredRows.length === 0 && 
    query.trim().length > 0;

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
          <>
            <DataTable 
              columns={activeView.columns ?? []} 
              data={filteredRows}
              emptyMessage={
                showEmptyMessage ? (
                  <div className="text-center py-12">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {activeView.emptyMessage || "No hay datos disponibles"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza agregando nuevos elementos.
                    </p>
                  </div>
                ) : showNoResultsMessage ? (
                  <div className="text-center py-12">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No se encontraron resultados
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Intenta con otros términos de búsqueda.
                    </p>
                  </div>
                ) : null
              }
            />
          </>
        ) : typeof activeView.render === "function" ? (
          activeView.render({ query })
        ) : null}
      </div>
    </section>
  );
}