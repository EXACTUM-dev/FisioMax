/**
 * Version: 1.0.0
 * Horizontal carousel component for displaying elements in a row
 * Includes responsive navigation, infinite scroll and group indicators
 */
import React, { useEffect, useRef, useState } from "react";
import VignetteImage from "./vignetteImage";
import { Title3, Paragraph2 } from "../atoms/typography";
import { IconButton, RightArrowIcon, LeftArrowIcon } from "../atoms/arrowIcons";
import { useVisibleCount } from "../organisms/carousel";

export default function RowCarousel({ slides = [] }) {
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

  // Navigation functions
  const goPrev = () => {
    if (infinite) setIndex((i) => (i - 1 + slides.length) % slides.length);
    else setIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    if (infinite) setIndex((i) => (i + 1) % slides.length);
    else {
      setIndex((i) => {
        const next = Math.min(maxStart, i + 1);
        if (next === maxStart) setInfinite(true);
        return next;
      });
    }
  };

  // CSS classes for responsive elements
  // Fit 3 on md with gap-6; 2 on sm with gap-4; on mobile suggest scroll
  const itemClass =
    "shrink-0 basis-[85%] sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-1rem)]";

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
                <li key={s.id ?? i} className={itemClass}>
                  {/* Image with vignette effect */}
                  <div className="relative h-40 sm:h-48 md:h-60 rounded-[1rem] overflow-hidden">
                    <VignetteImage
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      variant={vignette}
                      className="h-full"
                      cover
                    />
                  </div>

                  {/* Text content */}
                  <div className="mt-2">
                    <Title3 className="text-[1rem] md:text-[1.125rem]">
                      {s.title}
                    </Title3>
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
