/**
 * Version: 0.1.0
 * Static side container with vertical slides
 * Displays a list of CarouselSlides sorted vertically
 */
import React from "react";
import CarouselSlide from "../molecules/carouselSlide";
import VignetteImage from "../molecules/vignetteImage";
import { Title3, Paragraph2 } from "../atoms/typography";


// Slide estilo RowCarousel para uso en SideContainer
function CarouselSlideRow({ slide }) {
	return (
		<div className="w-full flex flex-col">
			<div className="relative h-32 md:h-40 rounded-[1rem] overflow-hidden">
				<VignetteImage
					src={slide.imageUrl}
					alt={slide.imageAlt}
					className="h-full"
					cover
				/>
			</div>
			<div className="mt-2 mb-4 pl-2">
				<Title3 className="text-[1rem] text-left">{slide.title}</Title3>
			</div>
		</div>
	);
}

/**
 * Main component that renders the slides vertically
 * @param {Array} slides - Slide object arrangement
 */
export default function SideContainer({ slides = [] }) {
	return (
				<aside
					className="w-full max-w-xs min-h-screen p-6 flex flex-col gap-2 rounded-[18px] mt-0 md:mt-8 mr-8"
					style={{ background: "#D9D9D9" }}
		>
			<h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Cursos y artículos</h2>
			{slides.map((slide) => (
				<CarouselSlideRow key={slide.id} slide={slide} />
			))}
		</aside>
	);
}
