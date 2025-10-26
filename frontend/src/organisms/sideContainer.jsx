/**
 * @fileoverview Static side container with vertical slides
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Displays a list of course slides sorted vertically with click interaction
 */

import React from "react";
import VignetteImage from "../molecules/vignetteImage";
import { Title3 } from "../atoms/typography";

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
      className="w-full flex flex-col cursor-pointer hover:opacity-80 transition-opacity group"
      onClick={onClick}
    >
      <div className="relative h-32 md:h-40 rounded-[1rem] overflow-hidden">
        <VignetteImage
          src={slide.imageUrl}
          alt={slide.imageAlt}
          className="h-full"
          cover
        />
      </div>
      <div className="mt-2 mb-4">
        <Title3
          className="text-[1rem] text-left line-clamp-2 group-hover:text-blue-600 transition-colors"
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
 * Main component that renders the slides vertically
 * @component
 * @param {Object} props - Component properties
 * @param {Array} props.slides - Array of slide objects
 * @param {Function} props.onSlideClick - Callback when slide is clicked
 * @returns {React.Element} SideContainer component
 */
export default function SideContainer({ slides = [], onSlideClick }) {
  return (
    <aside className="w-full bg-gray-50 p-6 flex flex-col gap-2 rounded-2xl">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
        Cursos y artículos
      </h2>
      {slides.length > 0 ? (
        slides.map((slide) => (
          <CarouselSlideRow
            key={slide.id}
            slide={slide}
            onClick={() => onSlideClick?.(slide)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-8">
          No hay cursos disponibles
        </p>
      )}
    </aside>
  );
}
