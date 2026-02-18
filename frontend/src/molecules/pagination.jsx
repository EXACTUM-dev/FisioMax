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
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-sm px-2 sm:px-4"
          ariaLabel="Página anterior"
        >
          <svg
            className="w-4 h-4 sm:mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 sm:px-2 text-slate-400 text-xs sm:text-sm"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[2rem] sm:min-w-[2.5rem] h-8 sm:h-10 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === page
                    ? "bg-brand text-stone-700"
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
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-sm px-2 sm:px-4"
          ariaLabel="Siguiente página"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <svg
            className="w-4 h-4 sm:ml-1"
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
        </Button>
      </div>
    </div>
  );
}
