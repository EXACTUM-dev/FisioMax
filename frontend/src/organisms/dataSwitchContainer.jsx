/**
 * @fileoverview Tabbed container component with optional external search support
 * @version 0.3.0
 * @author EXACTUM-dev
 * @description Supports both table and custom render views with external search control from parent
 */

import React, { useMemo } from "react";
import DataTable from "./dataTable";
import TabsNav from "../molecules/tabsNav";
import Loading from "../atoms/loading";

/**
 * Renders a switchable data container with tabs and optional loading state
 * Search is now controlled by parent component through AppHeader
 * @component
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.views - Array of view configurations
 * @param {string} [props.initialKey] - Initial active view key
 * @param {string} [props.activeKey] - Controlled active key from parent
 * @param {Function} [props.onTabChange] - Callback when tab changes
 * @param {string} [props.searchQuery=""] - External search query from parent
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
  searchQuery = "",
  className = "",
  toolbarRight = null,
  loading = false,
}) {
  const [internalActiveKey, setInternalActiveKey] = React.useState(
    initialKey ?? views[0]?.key
  );

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

  // Filter rows based on external search query for table views
  const filteredRows = useMemo(() => {
    if (activeView.type !== "table") return [];
    const q = searchQuery.trim().toLowerCase();
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
  }, [activeView, searchQuery]);

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

        {/* Right side: actions only (search is in AppHeader now) */}
        {toolbarRight && <div className="shrink-0">{toolbarRight}</div>}
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
            onRowAction={activeView.onRowAction}
            filterColumn={activeView.filterColumn}
            filterOptions={activeView.filterOptions}
          />
        ) : typeof activeView.render === "function" ? (
          activeView.render({ searchQuery })
        ) : null}
      </div>
    </section>
  );
}
