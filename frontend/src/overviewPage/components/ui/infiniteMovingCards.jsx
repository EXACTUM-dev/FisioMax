/**
 * @fileoverview Infinite moving cards component for testimonials
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState } from "react";

export default function InfiniteMovingCards({
  items,
  direction = "right",
  speed = "slow",
  pauseOnHover = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current.appendChild(duplicatedItem);
      });

      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "160s");
      }
      setStart(true);
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={`scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] ${className}`}
      style={{
        "--animation-direction": direction === "left" ? "forwards" : "reverse",
        "--animation-duration":
          speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s",
      }}
    >
      <ul
        ref={scrollerRef}
        className={`flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4 ${
          start ? "animate-scroll" : ""
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation:
            start &&
            `scroll var(--animation-duration) linear infinite var(--animation-direction)`,
        }}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-gradient-to-b from-[#fafafa] to-[#f5f5f5] px-8 py-6 md:w-[450px]"
            key={item.name + idx}
          >
            <blockquote>
              <span className="relative z-20 text-base leading-[1.6] font-normal text-neutral-800">
                "{item.quote}"
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#232323]">
                    {item.name}
                  </span>
                  <span className="text-sm text-neutral-500">{item.title}</span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}
