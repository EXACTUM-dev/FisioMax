/**
 * @fileoverview Pagination component for data tables
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Displays pagination controls with page numbers and navigation buttons
 */
import React from "react";
import Button from "../atoms/button";

/**
 * Pagination Component
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} [itemsPerPage=20] - Number of items per page
 * @param {number} [totalItems=0] - Total number of items
 * @returns {JSX.Element} Pagination controls
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20,
  totalItems = 0,
}) {
  
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if at the beginning
      if (currentPage <= 3) {
        end = 4;
      }

      // Adjust range if at the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis before range if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after range if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-neutral-200">
      {/* Items info */}
      <div className="text-sm text-slate-600">
        Mostrando <span className="font-medium">{startItem}</span> a{" "}
        <span className="font-medium">{endItem}</span> de{" "}
        <span className="font-medium">{totalItems}</span> resultados
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          label="Anterior"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-sm"
        />

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-slate-400"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-brand text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          label="Siguiente"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-sm"
        />
      </div>
    </div>
  );
}
