/**
 * @fileoverview Generic data table with responsive mobile cards, sortable columns, and pagination
 * @author EXACTUM-dev
 * @version 0.4.1
 * @description Columns are fully dynamic and can include custom renderers, metadata, sorting, and pagination
 */
import React, { useMemo, useState } from "react";
import Button from "../atoms/button";
import Pagination from "../molecules/pagination";

/**
 * DataTable Component
 * @description Responsive, dynamic table component with optional filters, sorting, pagination, and mobile cards
 * @param {Object[]} columns - Column definitions with label, key, sortable, and optional render/align metadata
 * @param {Object[]} data - Array of row data objects
 * @param {string} [filterColumn] - Optional column key used for filtering
 * @param {string[]} [filterOptions] - Array of filter values for the filter chips
 * @param {number} [itemsPerPage=20] - Number of items to display per page
 * @param {boolean} [enablePagination=true] - Enable/disable pagination
 * @param {string} [emptyMessage="No hay datos disponibles"] - Custom message when no data
 * @returns {JSX.Element} Responsive data table with sorting and pagination
 */
export default function DataTable({
  columns = [],
  data = [],
  filterColumn,
  filterOptions = [],
  itemsPerPage = 20,
  enablePagination = true,
  emptyMessage = "No hay datos disponibles",
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  /* Helpers for mobile layout (generic, driven by column metadata) */
  const nonActionCols = columns.filter((c) => !c.isAction);
  const actionCols = columns.filter((c) => c.isAction);

  /**
   * Header alignment helper: prefers headAlign, then align, then right for actions, else left
   */
  const getHeaderAlignClass = (col) => {
    const align =
      col?.headAlign || col?.align || (col?.isAction ? "right" : "left");
    if (align === "center") return "justify-center";
    if (align === "right") return "justify-end";
    return "justify-start";
  };

  /**
   * Handles column header click for sorting
   * @param {Object} col - Column configuration
   */
  const handleSort = (col) => {
    if (col.sortable === false || col.isAction) return;

    setSortConfig((prev) => {
      if (prev.key === col.key) {
        if (prev.direction === "asc") {
          return { key: col.key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key: col.key, direction: "asc" };
    });
  };

  /**
   * Gets the sort value for a row based on column configuration
   * @param {Object} row - Data row
   * @param {Object} col - Column configuration
   */
  const getSortValue = (row, col) => {
    if (typeof col.sortAccessor === "function") {
      return col.sortAccessor(row);
    }
    return row[col.key];
  };

  /**
   * Filters data based on active filter
   */
  const filteredData = useMemo(() => {
    if (!activeFilter || !filterColumn) return data;
    return data.filter((row) => row[filterColumn] === activeFilter);
  }, [activeFilter, filterColumn, data]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, data]);

  /**
   * Sorts filtered data based on sort configuration
   */
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = getSortValue(a, column);
      const bValue = getSortValue(b, column);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue, "es", { sensitivity: "base" });
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return sortConfig.direction === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, sortConfig, columns]);

  /**
   * Pagination logic - applies after sorting
   */
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, enablePagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  /**
   * Renders sort indicator icon
   * @param {Object} col - Column configuration
   */
  const SortIndicator = ({ col }) => {
    if (col.sortable === false || col.isAction) return null;

    const isActive = sortConfig.key === col.key;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <span className="inline-flex ml-1 align-middle">
        {!isActive && (
          <svg
            className="w-3.5 h-3.5 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        )}
        {isActive && direction === "asc" && (
          <svg
            className="w-3.5 h-3.5 text-[#CAD00F]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        )}
        {isActive && direction === "desc" && (
          <svg
            className="w-3.5 h-3.5 text-[#CAD00F]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </span>
    );
  };

  /**
   * Extracts raw text value from a column for mobile display
   * @param {Object} col - Column configuration
   * @param {Object} row - Row data
   * @returns {string} Plain text value
   */
  const getPlainTextValue = (col, row) => {
    if (!col) return "";

    // If there's a custom render function, try to get the raw value
    if (col.render) {
      // For columns with custom renders, try to get the raw data first
      const rawValue = row[col.key];
      if (rawValue != null) return String(rawValue);
    }

    // Otherwise use the key value
    return String(row[col.key] ?? "");
  };

  return (
    <div className="max-w-[70rem] mx-auto">
      {/* Optional filter chips */}
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
      <div className="hidden md:block">
        <div className="rounded-[18px] border border-neutral-200 bg-white overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-neutral-50 text-[11px] uppercase tracking-wide text-slate-500">
                  {columns.map((col) => {
                    const isSortable = col.sortable !== false && !col.isAction;

                    return (
                      <th
                        key={col.key}
                        className={`py-3 px-4 font-medium ${
                          col.className ?? ""
                        } ${col.headClassName ?? ""} ${
                          isSortable
                            ? "cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                            : ""
                        }`}
                        onClick={() => isSortable && handleSort(col)}
                      >
                        <div
                          className={`flex items-center gap-1 ${getHeaderAlignClass(
                            col
                          )}`}
                        >
                          <span>{col.label}</span>
                          <SortIndicator col={col} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((row, rowIndex) => {
                  const id =
                    row.id ??
                    row.IDUsuario ??
                    row.IDRol ??
                    row.name ??
                    rowIndex;
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

          {/* Empty state for desktop */}
          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 font-medium text-base">
                {emptyMessage || "No hay datos disponibles"}
              </p>
            </div>
          )}
        </div>

        {enablePagination && sortedData.length > 0 && (
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedData.length}
            />
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((row, rowIndex) => {
          const id =
            row.id ?? row.IDUsuario ?? row.IDRol ?? row.name ?? rowIndex;

          const primary = nonActionCols[0];
          const secondary = nonActionCols[1];
          const rest = nonActionCols.slice(2).filter((c) => !c.mobileHidden);

          // Get plain text value for primary field to show in title attribute
          const primaryText = primary ? getPlainTextValue(primary, row) : "";

          return (
            <div
              key={id}
              className="bg-white rounded-lg border border-neutral-200 shadow-sm"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  {/* Primary field (nombre/rol) */}
                  <div
                    className="font-semibold text-slate-900 text-base mb-1 truncate"
                    title={primaryText}
                  >
                    {primary
                      ? primary.render
                        ? primary.render(row)
                        : row[primary.key]
                      : "—"}
                  </div>

                  {/* Secondary field (estado/descripción) */}
                  {secondary && (
                    <div className="text-sm text-slate-600 mt-1.5">
                      <span className="font-medium text-slate-500">
                        {secondary.label}:{" "}
                      </span>
                      {secondary.render
                        ? secondary.render(row)
                        : row[secondary.key] ?? "N/A"}
                    </div>
                  )}
                </div>

                {/* Action buttons on the right */}
                {actionCols.length > 0 && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actionCols.map((col) => (
                      <div key={col.key}>
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card body with remaining fields */}
              {rest.length > 0 && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
                  <div className="space-y-2">
                    {rest.map((col) => (
                      <div
                        key={col.key}
                        className="flex justify-between items-center gap-4"
                      >
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {col.label}
                        </span>
                        <span className="text-sm text-slate-700 font-medium text-right break-words max-w-[65%]">
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

        {/* Empty state for mobile */}
        {sortedData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <p className="text-slate-600 font-medium text-base">
              {emptyMessage || "No hay datos disponibles"}
            </p>
          </div>
        )}

        {enablePagination && sortedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={sortedData.length}
          />
        )}
      </div>
    </div>
  );
}
