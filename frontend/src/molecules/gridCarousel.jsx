/**
 * @fileoverview Grid layout component for content display with alternating patterns
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description YouTube-style grid with alternating single/double width patterns (desktop only)
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import VignetteImage from "./vignetteImage";
import { Title3, Paragraph2 } from "../atoms/typography";

/**
 * Formats date to readable Spanish format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("es-ES", options);
};
/**
 * GridCarousel component with alternating layout patterns
 * Pattern: [1,1,1] -> [2,1] -> [1,2] (repeats after row 2)
 * Mobile: All items are single width
 * Desktop: Alternating pattern as described
 * @component
 * @param {Object} props
 * @param {Array} props.slides - Content slides array
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {boolean} props.showActions - Whether to show action menu (3 dots)
 * @returns {React.Element}
 */
export default function GridCarousel({ 
  slides = [], 
  onEdit, 
  onDelete, 
  showActions = false 
}) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const menuRefs = React.useRef({});

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  /**
   * Handles card click to navigate to content page
   * @param {number} contentId - Content ID
   */
  const handleCardClick = (contentId) => {
    navigate(`/content/${contentId}`);
  };

  /**
   * Toggles the action menu for a specific card
   */
  const handleMenuToggle = (e, contentId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === contentId ? null : contentId);
  };

  /**
   * Handles edit action
   */
  const handleEditClick = (e, slide) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (onEdit) onEdit(slide);
  };

  /**
   * Handles delete action
   */
  const handleDeleteClick = (e, slide) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (onDelete) onDelete(slide);
  };

  /**
   * Determines grid pattern for each row
   * Row 0 (mod 3 = 0): [1, 1, 1] - Three equal columns
   * Row 1 (mod 3 = 1): [2, 1] - One double-width, one single
   * Row 2 (mod 3 = 2): [1, 2] - One single, one double-width
   * Then repeats
   * @param {number} rowIndex - Current row index
   * @returns {Array<number>} Pattern array (1 = single column, 2 = double column)
   */
  const getRowPattern = (rowIndex) => {
    const patterns = [
      [1, 1, 1], // Row 0: Three singles
      [2, 1], // Row 1: Double + Single
      [1, 2], // Row 2: Single + Double
    ];
    return patterns[rowIndex % 3];
  };

  /**
   * Organizes slides into rows based on pattern
   * @returns {Array<Array>} Array of rows, each containing slides with pattern info
   */
  const organizeIntoRows = () => {
    const rows = [];
    let currentSlideIndex = 0;
    let rowIndex = 0;

    while (currentSlideIndex < slides.length) {
      const pattern = getRowPattern(rowIndex);
      const row = [];

      for (
        let i = 0;
        i < pattern.length && currentSlideIndex < slides.length;
        i++
      ) {
        row.push({
          slide: slides[currentSlideIndex],
          span: pattern[i],
        });
        currentSlideIndex++;
      }

      if (row.length > 0) {
        rows.push(row);
        rowIndex++;
      }
    }

    return rows;
  };

  const rows = organizeIntoRows();

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-[70rem] mx-auto space-y-4 md:space-y-6">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {row.map((item, itemIdx) => {
            const { slide, span } = item;

            // Determine column span classes - only apply on desktop (md and up)
            const colSpanClass = span === 2 ? "md:col-span-2" : "md:col-span-1";

            return (
              <div
                key={slide.id ?? `${rowIdx}-${itemIdx}`}
                className={`${colSpanClass} cursor-pointer group`}
                tabIndex={0}
                onClick={() => handleCardClick(slide.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(slide.id);
                  }
                }}
              >
                {/* Image container with fixed aspect ratio */}
                <div
                  className="relative w-full rounded-lg overflow-hidden bg-gray-200 transition-transform duration-300 group-hover:scale-[1.02] aspect-video md:aspect-auto"
                  style={
                    {
                      // Desktop only: depends on span
                      // Mobile: aspect-video class handles it (16/9)
                    }
                  }
                >
                  {/* Three dots menu */}
                  {showActions && (
                    <div
                      className="absolute top-2 right-2 z-10"
                      ref={(el) => (menuRefs.current[slide.id] = el)}
                    >
                      <button
                        onClick={(e) => handleMenuToggle(e, slide.id)}
                        className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
                        aria-label="Opciones"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {openMenuId === slide.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={(e) => handleEditClick(e, slide)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Modificar
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, slide)}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="hidden md:block w-full h-full"
                    style={{
                      aspectRatio: span === 2 ? "32/9" : "16/9",
                    }}
                  >
                    <VignetteImage
                      src={slide.imageUrl}
                      alt={slide.imageAlt || slide.title}
                      variant="none"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Mobile version - always 16/9 */}
                  <div className="block md:hidden w-full h-full">
                    <VignetteImage
                      src={slide.imageUrl}
                      alt={slide.imageAlt || slide.title}
                      variant="none"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content info */}
                <div className="mt-3">
                  <Title3 className="text-base md:text-lg line-clamp-2 group-hover:text-[#CAD00F] transition-colors">
                    {slide.title}
                  </Title3>

                  {/* Date if available */}
                  {slide.createdAt && (
                    <div className="flex items-center gap-1.5 mt-1 mb-1">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-gray-500">
                        {formatDate(slide.createdAt)}
                      </span>
                    </div>
                  )}

                  <Paragraph2 className="text-sm md:text-base text-slate-600 line-clamp-2 mt-1">
                    {slide.subtitle}
                  </Paragraph2>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
