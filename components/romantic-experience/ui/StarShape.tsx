"use client";

import { useId } from "react";
import { STAR_PAPER, type StarColor } from "@/lib/stars";

interface StarShapeProps {
  className?: string;
  /** Which paper this star is folded from. */
  color?: StarColor;
  /** When set, the star renders as a labelled image for screen readers. */
  title?: string;
}

/** The five-point outline, plus the creases from the centre to each point. */
const OUTLINE =
  "M50 3 61.46 34.22 94.7 35.48 68.55 56.03 77.63 88.02 50 69.5 22.37 88.02 31.45 56.03 5.3 35.48 38.54 34.22Z";
const CREASES = [
  "M50 50 50 3",
  "M50 50 94.7 35.48",
  "M50 50 77.63 88.02",
  "M50 50 22.37 88.02",
  "M50 50 5.3 35.48",
];

/**
 * A little folded-paper star — the kind chuchu makes from strips of paper. A
 * soft diagonal sheen and faint creases sell the "folded", not "drawn", read.
 */
export function StarShape({ className, color = "petal", title }: StarShapeProps) {
  const gradientId = useId();
  const paper = STAR_PAPER[color];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path
        d={OUTLINE}
        fill={paper}
        stroke="rgba(0,0,0,0.14)"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {CREASES.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={0.9}
          strokeLinecap="round"
        />
      ))}
      <path d={OUTLINE} fill={`url(#${gradientId})`} strokeLinejoin="round" />
    </svg>
  );
}
