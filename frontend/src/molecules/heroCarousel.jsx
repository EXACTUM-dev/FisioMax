/**
 * Version: 0.1.0
 * Hero section carousel component
 * Includes navigation with buttons and responsive indicators
 */
import React, { useState } from "react";
import CarouselSlide from "./carouselSlide";
import { IconButton, LeftArrowIcon, RightArrowIcon } from "../atoms/arrowIcons";

export default function HeroCarousel({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  // Carousel navigation functions
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  if (total === 0) return null;

  return (
    <div className="w-full max-w-[70rem] mx-auto">
      <div className="relative rounded-[1.125rem] overflow-hidden bg-[#0b0b0b]">
        {/* Current slide */}
        <CarouselSlide slide={slides[index]} />

        {/* Previous navigation button */}
        <div className="absolute top-1/2 -translate-y-1/2 left-3.5 z-30">
          <IconButton
            ariaLabel="Previous"
            onClick={goPrev}
            className="w-10 h-10 md:w-11 md:h-11"
          >
            <LeftArrowIcon size={18} />
          </IconButton>
        </div>

        {/* Next navigation button */}
        <div className="absolute top-1/2 -translate-y-1/2 right-3.5 z-30">
          <IconButton
            ariaLabel="Next"
            onClick={goNext}
            className="w-10 h-10 md:w-11 md:h-11"
          >
            <RightArrowIcon size={18} />
          </IconButton>
        </div>

        {/* Desktop indicators, over the image */}
        {slides.length > 1 && (
          <div className="hidden sm:flex justify-center gap-1.5 absolute bottom-3 left-0 right-0 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`View slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === index ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile indicators, below the image */}
      {slides.length > 1 && (
        <div className="flex sm:hidden justify-center gap-2 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`View slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === index ? "bg-slate-800 scale-125" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
