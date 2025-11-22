/**
 * @fileoverview Tabbed container component with search and loading states
 * @version 0.4.1
 * @author EXACTUM-dev
 * @description Supports both table and custom render views with static search bar - Fixed mobile UI
 */

import React, { useMemo, useState } from "react";
import DataTable from "./dataTable";
import TabsNav from "../molecules/tabsNav";
import SearchBarStatic from "../molecules/searchBarStatic";
import Loading from "../atoms/loading";

/**
 * Renders a switchable data container with tabs and optional loading state
 * @component
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.views - Array of view configurations
 * @param {string} [props.initialKey] - Initial active view key
 * @param {string} [props.activeKey] - Controlled active key from parent
 * @param {Function} [props.onTabChange] - Callback when tab changes
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {React.ReactNode} [props.toolbarRight] - Right-aligned toolbar content
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @returns {React.Element} DataSwitchContainer component
 */
export default function DataSwitchContainer({
  views = [],
  initialKey,
  activeKey: controlledActiveKey,
  onTabChange,
  className = "",
  toolbarRight = null,
  loading = false,
}) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    initialKey ?? views[0]?.key
  );
  const [query, setQuery] = useState("");

  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleTabChange = (newKey) => {
    if (onTabChange) {
      onTabChange(newKey);
    }
    if (controlledActiveKey === undefined) {
      setInternalActiveKey(newKey);
    }
  };

  const activeView = views.find((v) => v.key === activeKey) ?? views[0] ?? {};

  // Enable search by default for table views, allow override via searchEnabled prop
  const searchEnabled =
    activeView.searchEnabled ?? (activeView.type === "table" ? true : false);

  // Filter rows based on search query for table views
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
      {/* Header / toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4">
        <TabsNav
          items={views.map((v) => ({ key: v.key, label: v.label }))}
          activeKey={activeKey}
          onChange={handleTabChange}
          ariaLabel="Data views"
        />

        {/* Right side: search + actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {searchEnabled && (
            <SearchBarStatic
              value={query}
              onChange={setQuery}
              placeholder={activeView.searchPlaceholder ?? "Buscar..."}
            />
          )}
          {toolbarRight && <div className="shrink-0">{toolbarRight}</div>}
        </div>
      </div>

      {/* Content */}
      <div
        id={`panel-${activeKey}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeKey}`}
        className="rounded-[18px] border border-slate-200 bg-white p-4 md:p-6"
      >
        {loading ? (
          <Loading fullscreen={false} message="Cargando datos..." size={40} />
        ) : activeView.type === "table" ? (
          <DataTable
            columns={activeView.columns ?? []}
            data={filteredRows}
            onRowClick={activeView.onRowClick}
            filterColumn={activeView.filterColumn}
            filterOptions={activeView.filterOptions}
            emptyMessage={activeView.emptyMessage}
          />
        ) : typeof activeView.render === "function" ? (
          activeView.render({ query })
        ) : null}
      </div>
    </section>
  );
}
