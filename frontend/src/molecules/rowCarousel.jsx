/**
 * @fileoverview RowCarousel component for horizontal scrolling of content cards
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description A horizontal carousel component that displays content cards in a row with responsive navigation, infinite scroll, group indicators, click navigation and dates.
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VignetteImage from "./vignetteImage";
import { Title3, Paragraph2 } from "../atoms/typography";
import { IconButton, RightArrowIcon, LeftArrowIcon } from "../atoms/arrowIcons";
import { useVisibleCount } from "../organisms/carousel";

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

export default function RowCarousel({ slides = [] }) {
  const navigate = useNavigate();

  // Custom hook to determine visible elements based on screen size
  const visibleCount = useVisibleCount();
  const isMobile = visibleCount === 1;

  const [index, setIndex] = useState(0);
  const [infinite, setInfinite] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Calculations for carousel navigation
  const maxStart = Math.max(0, slides.length - visibleCount);
  const start = Math.min(index, maxStart);

  const hasPrev = start > 0;
  const hasNext = start + visibleCount < slides.length;

  // Navigation functions with single-click loop
  const goPrev = () => {
    if (infinite) {
      // If infinite mode, clicking prev from start goes to end
      if (index === 0) {
        setIndex(maxStart);
      } else {
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      }
    } else {
      setIndex((i) => Math.max(0, i - 1));
    }
  };

  const goNext = () => {
    if (infinite) {
      // If infinite mode, clicking next from end goes to start
      if (index >= maxStart) {
        setIndex(0);
      } else {
        setIndex((i) => (i + 1) % slides.length);
      }
    } else {
      setIndex((i) => {
        const next = Math.min(maxStart, i + 1);
        if (next === maxStart) setInfinite(true);
        return next;
      });
    }
  };

  /**
   * Handles slide click to navigate to content page
   * @param {Object} slide - Slide data
   */
  const handleSlideClick = (slide) => {
    if (slide?.id) {
      navigate(`/content/${slide.id}`);
    }
  };

  // CSS classes for responsive elements
  const itemClass =
    "shrink-0 basis-[85%] sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-1rem)] cursor-pointer";

  // Effect for smooth scroll when changing slides
  useEffect(() => {
    const track = trackRef.current;
    const scroller = containerRef.current;
    if (!track || !scroller) return;
    const child = track.children[start % slides.length];
    if (child)
      scroller.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, [start, visibleCount, slides.length]);

  // States for mobile scroll detection
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [hasScrolledLeft, setHasScrolledLeft] = useState(false);
  const [hasScrolledRight, setHasScrolledRight] = useState(true);

  // Effect to detect scroll and centered element on mobile
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const onScroll = () => {
      if (isMobile && trackRef.current) {
        // Detects which element is most centered in view
        const center = container.scrollLeft + container.clientWidth / 2;
        const items = Array.from(trackRef.current.children);
        let closestIdx = 0;
        let min = Number.MAX_VALUE;
        items.forEach((el, idx) => {
          const c = el.offsetLeft + el.clientWidth / 2;
          const d = Math.abs(center - c);
          if (d < min) {
            min = d;
            closestIdx = idx;
          }
        });
        setActiveMobileIndex(closestIdx);
      }

      // Updates scroll states for gradients
      setHasScrolledLeft(container.scrollLeft > 10);
      const atRight =
        container.scrollLeft >=
        container.scrollWidth - container.clientWidth - 10;
      setHasScrolledRight(!atRight);
      if (atRight && !infinite) setInfinite(true);
    };
    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [isMobile, infinite]);

  // Group indicators configuration
  const groupSize = 3;
  const totalGroups = Math.ceil(slides.length / groupSize);
  const activeGroup = isMobile
    ? Math.floor(activeMobileIndex / groupSize)
    : Math.floor(start / groupSize);

  return (
    <div className="w-full max-w-[70rem] mx-auto">
      <div className="relative">
        {/* Main container with horizontal scroll */}
        <div
          ref={containerRef}
          className="overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
        >
          <ul
            ref={trackRef}
            className="flex gap-4 md:gap-6 pr-[15%] sm:pr-0 md:pr-0"
          >
            {slides.map((s, i) => {
              // Vignette configuration for edge elements
              const isLeftEdge = i === start;
              const isRightEdge =
                i === Math.min(slides.length - 1, start + visibleCount - 1);
              const vignette =
                isMobile && (isLeftEdge || isRightEdge)
                  ? isLeftEdge && isRightEdge
                    ? "full"
                    : isLeftEdge
                    ? "left"
                    : "right"
                  : "none";

              return (
                <li
                  key={s.id ?? i}
                  className={itemClass}
                  onClick={() => handleSlideClick(s)}
                >
                  {/* Image with vignette effect */}
                  <div className="relative h-40 sm:h-48 md:h-60 rounded-[1rem] overflow-hidden group">
                    <VignetteImage
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      className="h-full"
                      variant="transparent"
                      cover
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Text content */}
                  <div className="mt-2">
                    <Title3 className="text-[1rem] md:text-[1.125rem] group-hover:text-[#CAD00F] transition-colors">
                      {s.title}
                    </Title3>

                    {/* Date if available */}
                    {s.createdAt && (
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
                        <span className="text-[0.75rem] md:text-[0.8125rem] text-gray-500">
                          {formatDate(s.createdAt)}
                        </span>
                      </div>
                    )}

                    <Paragraph2 className="text-[0.8125rem] md:text-[0.875rem] text-slate-600 line-clamp-2">
                      {s.subtitle}
                    </Paragraph2>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Navigation buttons for desktop/tablet */}
        {slides.length > visibleCount && (
          <div className="hidden sm:block absolute left-0 right-0 top-0 h-40 sm:h-48 md:h-60 z-30 pointer-events-none">
            <div className="h-full flex items-center justify-between px-3.5">
              <div className="pointer-events-auto">
                <IconButton
                  ariaLabel="Previous"
                  onClick={goPrev}
                  className="w-10 h-10 md:w-11 md:h-11"
                  disabled={!infinite && !hasPrev}
                >
                  <LeftArrowIcon size={18} />
                </IconButton>
              </div>
              <div className="pointer-events-auto">
                <IconButton
                  ariaLabel="Next"
                  onClick={goNext}
                  className="w-10 h-10 md:w-11 md:h-11"
                  disabled={!infinite && !hasNext}
                >
                  <RightArrowIcon size={18} />
                </IconButton>
              </div>
            </div>
          </div>
        )}

        {/* Scroll indicator gradients mobile only */}
        {isMobile && hasScrolledLeft && (
          <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {isMobile && hasScrolledRight && (
          <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* Group indicators for elements */}
      {slides.length > groupSize && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalGroups }).map((_, g) => {
            const groupStart = g * groupSize;
            return (
              <button
                key={g}
                aria-label={`View group ${g + 1}`}
                onClick={() => {
                  setIndex(groupStart);
                  const scroller = containerRef.current;
                  const track = trackRef.current;
                  if (!track || !scroller) return;
                  const child = track.children[groupStart % slides.length];
                  if (child)
                    scroller.scrollTo({
                      left: child.offsetLeft,
                      behavior: "smooth",
                    });
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  g === activeGroup ? "bg-slate-800 scale-125" : "bg-slate-300"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
