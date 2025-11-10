/**
 * @fileoverview CaptionCard molecule component
 * @version 0.2.0
 * @author EXACTUM-dev
 * @description A caption card displaying title, subtitle, and creation date with responsive truncation and optional subtitle hiding.
 */
import React, { useEffect, useState } from "react";
import { Title2, Paragraph2 } from "../atoms/typography";

// Function to truncate text by character count
function truncateByChars(text = "", limit) {
  if (!limit || text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

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

export default function CaptionCard({
  title,
  subtitle,
  createdAt,
  maxCharsMobile = 50,
  showSubtitle = true,
}) {
  const [isSmUp, setIsSmUp] = useState(false);

  useEffect(() => {
    // Detects screen breakpoint changes to show full or truncated content
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = (e) => setIsSmUp(e.matches);
    setIsSmUp(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  // Determines the subtitle to show based on screen size
  const subtitleToShow = isSmUp
    ? subtitle
    : truncateByChars(subtitle, maxCharsMobile);

  return (
    <div
      className="
        absolute left-0 bottom-0
        right-3 sm:right-auto
        bg-white text-slate-900
        shadow-[0_10px_25px_rgba(0,0,0,0.15)]
        rounded-tr-[1rem] rounded-bl-[1rem] rounded-tl-[0] rounded-br-[0]
        pl-5 pr-3 md:pr-5
        py-2.5 md:py-4
        max-w-none sm:max-w-[22rem] md:max-w-[32rem]
      "
    >
      {/* Smaller typography on mobile; grows on sm/md */}
      <Title2 className="mb-1 sm:mb-1.5 text-[1rem] sm:text-[1.125rem] md:text-[1.25rem]">
        {title}
      </Title2>

      {/* Date with icon */}
      {createdAt && (
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
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
          <span className="text-[0.75rem] sm:text-[0.8125rem] md:text-[0.875rem] text-gray-600 font-medium">
            {formatDate(createdAt)}
          </span>
        </div>
      )}

      {/* Subtitle - only shown if showSubtitle is true */}
      {showSubtitle && subtitle && (
        <Paragraph2 className="leading-[1.5] text-[0.8125rem] sm:text-[0.875rem] md:text-[0.9375rem] mt-1.5 sm:mt-2">
          {subtitleToShow}
        </Paragraph2>
      )}
    </div>
  );
}
