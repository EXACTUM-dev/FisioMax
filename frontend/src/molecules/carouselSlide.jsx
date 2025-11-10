/**
 * @fileoverview Individual slide component for carousel
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description Combines image with vignette and overlaid information card with fallback support and optional subtitle display
 */

import React from "react";
import VignetteImage from "./vignetteImage";
import CaptionCard from "./captionCard";

/**
 * CarouselSlide component with image fallback
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.slide - Slide data object
 * @param {string} props.slide.imageUrl - Image URL
 * @param {string} props.slide.imageAlt - Image alt text
 * @param {string} props.slide.title - Slide title
 * @param {string} props.slide.subtitle - Slide subtitle
 * @param {boolean} [props.showSubtitle=true] - Whether to show subtitle
 * @returns {React.Element} CarouselSlide component
 */
export default function CarouselSlide({ slide, showSubtitle = true }) {
  if (!slide) return null;

  return (
    <>
      {/* Background image with vignette */}
      <VignetteImage
        src={slide.imageUrl}
        alt={slide.imageAlt || slide.title}
        variant="dark"
        className="absolute inset-0"
      />

      {/* Caption card with optional subtitle */}
      <CaptionCard
        title={slide.title}
        subtitle={slide.subtitle}
        createdAt={slide.createdAt}
        showSubtitle={showSubtitle}
      />
    </>
  );
}
