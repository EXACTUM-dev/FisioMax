/**
 * Version: 0.2.0
 * Generic data table with multi-selection and responsive mobile cards
 * Columns are fully dynamic and can include custom renderers and metadata
 */
import React, { useMemo, useState } from "react";
import Checkbox from "../atoms/checkbox";
import TableRow from "../molecules/tableRow";

export default function DataTable({ columns = [], data = [] }) {
  // Selection state
  const [selected, setSelected] = useState(() => new Set());

  // Unique IDs
  const allIds = useMemo(() => data.map((r) => r.id ?? r.name), [data]);

  // Main checkbox states
  const allChecked = selected.size > 0 && selected.size === allIds.length;
  const indeterminate = selected.size > 0 && selected.size < allIds.length;

  const toggleAll = () => {
    setSelected((prev) => {
      if (prev.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Helpers for mobile layout (generic, driven by column metadata)
  // You can set col.isAction = true to show an action in the card header right area on mobile
  // You can set col.mobileHidden = true to hide a column in mobile card body
  const nonActionCols = columns.filter((c) => !c.isAction);
  const actionCols = columns.filter((c) => c.isAction);

  // Header alignment helper: prefers headAlign, then align, then right for actions, else left
  const getHeaderAlignClass = (col) => {
    const align =
      col?.headAlign || col?.align || (col?.isAction ? "right" : "left");
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="max-w-[70rem] mx-auto">
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block rounded-[18px] border border-neutral-200 bg-white overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed">
            {/* Table header */}
            <thead>
              <tr className="bg-neutral-50 text-[11px] uppercase tracking-wide text-slate-500">
                {/* Select all */}
                <th className="w-12 pl-4 pr-2 py-3 text-left">
                  <Checkbox
                    ariaLabel="Select all"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-checked={indeterminate ? "mixed" : allChecked}
                  />
                </th>
                {/* Dynamic columns */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 pr-4 font-medium ${col.className ?? ""} ${
                      col.headClassName ?? ""
                    } ${getHeaderAlignClass(col)}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table body */}
            <tbody>
              {data.map((row) => {
                const id = row.id ?? row.name;
                return (
                  <TableRow
                    key={id}
                    row={row}
                    columns={columns}
                    checked={selected.has(id)}
                    onToggle={() => toggleOne(id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {/* Mobile header with select all */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              ariaLabel="Select all"
              checked={allChecked}
              onChange={toggleAll}
              aria-checked={indeterminate ? "mixed" : allChecked}
            />
            <span className="text-sm font-medium text-slate-600">
              {selected.size > 0 ? `${selected.size} selected` : "Select all"}
            </span>
          </div>
          <span className="text-xs text-slate-500">{data.length} items</span>
        </div>

        {/* Mobile cards (generic) */}
        {data.map((row) => {
          const id = row.id ?? row.name;
          const isSelected = selected.has(id);

          const primary = nonActionCols[0];
          const secondary = nonActionCols[1];
          const rest = nonActionCols.slice(2).filter((c) => !c.mobileHidden);

          return (
            <div
              key={id}
              className={`bg-white rounded-lg border transition-all duration-200 ${
                isSelected
                  ? "border-blue-200 bg-blue-50/30 shadow-sm"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4 pb-3">
                <Checkbox
                  ariaLabel="Select item"
                  checked={isSelected}
                  onChange={() => toggleOne(id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {primary
                      ? primary.render
                        ? primary.render(row)
                        : row[primary.key]
                      : "—"}
                  </div>
                  {secondary && (
                    <div className="text-sm text-slate-500 mt-1 truncate">
                      {secondary.label}:{" "}
                      {secondary.render
                        ? secondary.render(row)
                        : row[secondary.key] ?? "N/A"}
                    </div>
                  )}
                </div>

                {/* Inline actions (if any) */}
                {actionCols.length > 0 && (
                  <div className="flex items-center gap-1">
                    {actionCols.map((col) => (
                      <div key={col.key} className="ml-1">
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card body with remaining fields */}
              {rest.length > 0 && (
                <div className="px-4 pb-4 pt-0 border-t border-neutral-100 bg-neutral-50/30">
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {rest.map((col) => (
                      <div
                        key={col.key}
                        className="flex justify-between items-center gap-4"
                      >
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          {col.label}
                        </span>
                        <span className="text-sm text-slate-700 font-medium truncate max-w-[60%] text-right">
                          {col.render ? col.render(row) : row[col.key] ?? "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
