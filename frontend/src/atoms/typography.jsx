/**
 * Version: 0.1.0
 * Reusable typography components
 * Includes titles and paragraphs with predefined responsive styles
 */
import React from "react";

// Utility function to concatenate CSS classes
const cx = (...c) => c.filter(Boolean).join(" ");

// Main title of first level
export const Title1 = ({ children, className, style, ...rest }) => (
  <h1
    className={cx(
      "m-0 leading-[1.2] text-slate-900 font-bold text-[1.5rem] md:text-[2rem]",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </h1>
);

// Second level title for sections
export const Title2 = ({ children, className, style, ...rest }) => (
  <h2
    className={cx(
      "m-0 leading-[1.2] text-slate-900 font-bold text-[1.125rem] sm:text-[1.25rem] md:text-[1.5rem]",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </h2>
);

// Third level title for subsections
export const Title3 = ({ children, className, style, ...rest }) => (
  <h3
    className={cx(
      "m-0 leading-[1.2] text-slate-900 font-semibold text-[1.125rem] md:text-[1.25rem]",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </h3>
);

// Main paragraph with larger text
export const Paragraph1 = ({ children, className, style, ...rest }) => (
  <p
    className={cx(
      "m-0 leading-[1.5] text-slate-600 text-[0.9375rem] md:text-[1rem]",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </p>
);

// Secondary paragraph with medium size
export const Paragraph2 = ({ children, className, style, ...rest }) => (
  <p
    className={cx(
      "m-0 leading-[1.5] text-slate-600 text-[0.875rem] md:text-[0.9375rem]",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </p>
);

// Small paragraph for auxiliary texts
export const Paragraph3 = ({ children, className, style, ...rest }) => (
  <p
    className={cx(
      "m-0 leading-[1.5] text-slate-600 text-[0.8125rem] md:text-sm",
      className
    )}
    style={style}
    {...rest}
  >
    {children}
  </p>
);
