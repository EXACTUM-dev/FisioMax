/**
 * @fileoverview Generic data table with responsive mobile cards, sortable columns, and pagination
 * @author EXACTUM-dev
 * @version 0.3.1
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
 * @param {Function} [onRowClick] - Optional callback when clicking on a row
 * @returns {JSX.Element} Responsive data table with sorting and pagination
 */
export default function DataTable({
  columns = [],
  data = [],
  filterColumn,
  filterOptions = [],
  itemsPerPage = 20,
  enablePagination = true,
  onRowClick,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  /* Helpers for mobile layout (generic, driven by column metadata) */
  const nonActionCols = columns.filter((c) => !c.isAction);
  const actionCols = columns.filter((c) => !c.isAction);

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
   * Handles row click and prevents propagation from interactive elements
   * @param {Event} e - Click event
   * @param {Object} row - Row data
   */
  const handleRowClick = (e, row) => {
    if (!onRowClick) return;

    const target = e.target;
    const isInteractive =
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest('[role="button"]');

    if (!isInteractive) {
      onRowClick(row);
    }
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

                  {onRowClick && (
                    <th className="w-8 py-3 px-2" aria-label="Navegación"></th>
                  )}
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
                    <tr
                      key={id}
                      onClick={(e) => handleRowClick(e, row)}
                      className={`border-t border-neutral-200 ${
                        onRowClick
                          ? "cursor-pointer hover:bg-slate-50 transition-colors group"
                          : ""
                      }`}
                    >
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

                      {onRowClick && (
                        <td className="w-8 py-3 px-2">
                          <svg
                            className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

          return (
            <div
              key={id}
              onClick={(e) => handleRowClick(e, row)}
              className={`bg-white rounded-lg border border-neutral-200 relative ${
                onRowClick
                  ? "cursor-pointer hover:border-neutral-300 active:bg-slate-50"
                  : "hover:border-neutral-300"
              }`}
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

                {onRowClick && (
                  <div className="flex-shrink-0 flex items-center">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Inline actions (if any) */}
                {actionCols.length > 0 && !onRowClick && (
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
        {sortedData.length === 0 && (
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
            <p className="text-slate-500 text-sm">No hay datos disponibles</p>
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
