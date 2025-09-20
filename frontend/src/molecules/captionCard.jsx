/**
 * Version: 0.1.0
 * Footer caption card component
 * Displays title and subtitle with responsive truncation on mobile devices
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

export default function CaptionCard({ title, subtitle, maxCharsMobile = 50 }) {
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
      <Paragraph2 className="leading-[1.5] text-[0.8125rem] sm:text-[0.875rem] md:text-[0.9375rem]">
        {subtitleToShow}
      </Paragraph2>
    </div>
  );
}
