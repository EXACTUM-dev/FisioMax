/**
 * @fileoverview Generic data table with responsive mobile cards
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Columns are fully dynamic and can include custom renderers and metadata
 */
import React, { useMemo, useState} from "react";
import TableRow from "../molecules/tableRow";
import Button from "../atoms/button";

/**
 * DataTable Component
 * @description Responsive, dynamic table component with optional filters and mobile cards
 * @param {Object[]} columns - Column definitions with label, key, and optional render/align metadata
 * @param {Object[]} data - Array of row data objects
 * @param {string} [filterColumn] - Optional column key used for filtering
 * @param {string[]} [filterOptions] - Array of filter values for the filter chips
 * @returns {JSX.Element} Responsive data table
 */
export default function DataTable({ columns = [], data = [], filterColumn, filterOptions = [],}) {
  /* Helpers for mobile layout (generic, driven by column metadata)
   You can set col.isAction = true to show an action in the card header right area on mobile
   You can set col.mobileHidden = true to hide a column in mobile card body */
  const nonActionCols = columns.filter((c) => !c.isAction);
  const actionCols = columns.filter((c) => c.isAction);

  const [activeFilter, setActiveFilter] = useState(null);

  // Header alignment helper: prefers headAlign, then align, then right for actions, else left
  const getHeaderAlignClass = (col) => {
    const align =
      col?.headAlign || col?.align || (col?.isAction ? "right" : "left");
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };
  const filteredData = useMemo(() => {
    if (!activeFilter || !filterColumn) return data;
    return data.filter((row) => row[filterColumn] === activeFilter);
  }, [activeFilter, filterColumn, data]);


  return (
    <div className="max-w-[70rem] mx-auto">
      {/* Optional filter chip */}
      {filterColumn && filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterOptions.map((option) => (
            <Button
              key={option}
              label={option}
              variant={activeFilter === option ? "brand" : "outline"}
              radius="full"
              size="sm"
              onClick={() =>
                setActiveFilter((prev) => (prev === option ? null : option))
              }
              className={`transition ${
                activeFilter === option
                  ? "border-brand"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            />

          ))}
        </div>
      )}
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block rounded-[18px] border border-neutral-200 bg-white overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed">
            {/* Table header */}
            <thead>
              <tr className="bg-neutral-50 text-[11px] uppercase tracking-wide text-slate-500">
                {/* Dynamic columns */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-4 font-medium ${col.className ?? ""} ${
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
              {filteredData.map((row, rowIndex) => {
                const id = row.id ?? row.IDUsuario ?? row.IDRol ?? row.name ?? rowIndex;
                return (
                  <tr key={id} className="border-t border-neutral-200">
                    {columns.map((col) => (
                      <td
                        key={`${id}-${col.key}`}
                        className={`py-3 px-4 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        } ${col.className ?? ""}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {/* Mobile cards (generic) */}
        {filteredData.map((row, rowIndex) => {
          const id = row.id ?? row.IDUsuario ?? row.IDRol ?? row.name ?? rowIndex;

          const primary = nonActionCols[0];
          const secondary = nonActionCols[1];
          const rest = nonActionCols.slice(2).filter((c) => !c.mobileHidden);

          return (
            <div
              key={id}
              className="bg-white rounded-lg border border-neutral-200 hover:border-neutral-300"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4 pb-3">
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
