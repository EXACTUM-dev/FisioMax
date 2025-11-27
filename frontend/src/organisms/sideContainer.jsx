/**
 * @fileoverview Static side container with vertical slides and pagination
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Displays a list of course slides sorted vertically with click interaction and load more functionality
 */

import React from "react";
import VignetteImage from "../molecules/vignetteImage";
import { Title3 } from "../atoms/typography";
import Button from "../atoms/button";

/**
 * Individual course slide component for row display
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.slide - Slide data object
 * @param {Function} props.onClick - Click handler function
 * @returns {React.Element} CarouselSlideRow component
 */
function CarouselSlideRow({ slide, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full flex flex-col cursor-pointer hover:opacity-80 transition-opacity group"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative h-32 md:h-40 rounded-[1rem] overflow-hidden">
        <VignetteImage
          src={slide.imageUrl}
          alt={slide.imageAlt}
          className="h-full"
          variant="transparent"
          cover
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/SOMEFIPP-Logo.jpeg";
          }}
        />
      </div>
      <div className="mt-2 mb-4">
        <Title3
          className="text-[1rem] text-left line-clamp-2 group-hover:text-[#CAD00F] transition-colors"
          title={slide.title}
        >
          {slide.title}
        </Title3>
        {slide.subtitle && (
          <p
            className="text-xs text-gray-500 mt-1 line-clamp-1"
            title={slide.subtitle}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Main component that renders the slides vertically with pagination support
 * @component
 * @param {Object} props - Component properties
 * @param {Array} props.slides - Array of slide objects
 * @param {Function} props.onSlideClick - Callback when slide is clicked
 * @param {boolean} props.hasMore - Whether there are more items to load
 * @param {boolean} props.loading - Whether more items are being loaded
 * @param {Function} props.onLoadMore - Callback to load more items
 * @param {string} props.emptyMessage - Message to show when no slides available
 * @param {string} props.completedMessage - Message to show when all slides loaded
 * @param {string} props.loadMoreText - Text for load more button
 * @returns {React.Element} SideContainer component
 */
export default function SideContainer({
  slides = [],
  onSlideClick,
  hasMore = false,
  loading = false,
  onLoadMore,
  emptyMessage = "No hay cursos disponibles",
  completedMessage = "✓ Todos los videos cargados",
  loadMoreText = "Cargar más videos",
}) {
  // SideContainer no longer aplica el filtrado por fechas; el upstream
  // (`homePage` / `content`) debe enviar solo los descuentos vigentes.
  const visibleSlides = slides || [];
  return (
    <aside className="w-full bg-[#FAFAFA] p-6 flex flex-col gap-2">
      {visibleSlides.length > 0 ? (
        <>
          {visibleSlides.map((slide) => (
            <CarouselSlideRow
              key={slide.id}
              slide={slide}
              onClick={() => onSlideClick?.(slide)}
            />
          ))}

          {hasMore && onLoadMore && (
            <div className="mt-2">
              <Button
                onClick={onLoadMore}
                disabled={loading}
                fullWidth
                size="sm"
                variant="outline"
                radius="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  loadMoreText
                )}
              </Button>
            </div>
          )}

          {!hasMore && visibleSlides.length > 0 && (
            <div className="text-center mt-2">
              <p className="text-gray-500 text-sm">{completedMessage}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
      )}
    </aside>
  );
}
