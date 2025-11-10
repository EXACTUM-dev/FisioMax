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
 * @fileoverview Componente SlideCard para mostrar información de un slide.
 * @param {Object} props
 * @param {Object} props.slide - Objeto con los datos del slide.
 * @param {string} props.slide.title - Título del slide.
 * @param {string} props.slide.createdAt - Fecha de creación del slide.
 * @param {string} [props.slide.image] - URL de la imagen del slide.
 * @param {Function} [props.onClick] - Callback al hacer click.
 * @returns {JSX.Element}
 */
export default function CarouselSlide({ slide, showSubtitle = true }) {
  if (!slide) return null;

  return (
    <>
      {/* Background image with vignette */}
      <VignetteImage
        src={slide.imageUrl}
        alt={slide.imageAlt || slide.title}
        variant="transparent"
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
