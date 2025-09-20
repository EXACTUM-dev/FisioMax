/**
 * Version: 0.1.0
 * Individual slide component for carousel
 * Combines image with vignette and overlaid information card
 */
import React from "react";
import VignetteImage from "./vignetteImage";
import CaptionCard from "./captionCard";

export default function CarouselSlide({ slide }) {
  return (
    // Main container with image and vignette effect
    <VignetteImage
      src={slide.imageUrl}
      alt={slide.imageAlt}
      style={{ borderRadius: 18 }}
    >
      {/* Information card overlaid at the bottom */}
      <CaptionCard title={slide.title} subtitle={slide.subtitle} />
    </VignetteImage>
  );
}
