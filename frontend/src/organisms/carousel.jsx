/**
 * Version: 0.1.0
 * Main carousel component with multiple variants
 * Handles both hero carousel and row carousel based on specified variant
 */
import React from "react";
import HeroCarousel from "../molecules/heroCarousel";
import RowCarousel from "../molecules/rowCarousel";

/**
 * Custom hook to determine visible elements based on breakpoint
 * Returns 1 element on mobile, 2 on tablet, 3 on desktop
 */
export function useVisibleCount() {
  const [count, setCount] = React.useState(1);

  React.useEffect(() => {
    // Media queries for different breakpoints
    const mSm = window.matchMedia("(min-width: 640px)");
    const mMd = window.matchMedia("(min-width: 768px)");

    // Function to update count based on screen size
    const update = () => setCount(mMd.matches ? 3 : mSm.matches ? 2 : 1);
    update();

    // Event listeners for breakpoint changes
    const handler = () => update();
    mSm.addEventListener?.("change", handler) ?? mSm.addListener(handler);
    mMd.addEventListener?.("change", handler) ?? mMd.addListener(handler);

    // Event listeners cleanup
    return () => {
      mSm.removeEventListener?.("change", handler) ??
        mSm.removeListener(handler);
      mMd.removeEventListener?.("change", handler) ??
        mMd.removeListener(handler);
    };
  }, []);

  return count;
}

/**
 * Main component that renders the appropriate carousel type
 */
export default function Carousel({ slides = [], variant = "hero" }) {
  // Renders row carousel for "row" variant
  if (variant === "row") return <RowCarousel slides={slides} />;

  // By default renders hero carousel
  return <HeroCarousel slides={slides} />;
}
