"use client";

import { useId } from "react";

interface CandyIconProps {
  className?: string;
  /** Two-tone wrapper colour. */
  tone?: "pink" | "lilac" | "honey";
}

const TONES = {
  pink: ["#ffd7e8", "#ff9ec4"],
  lilac: ["#e4d7ff", "#c1a6ff"],
  honey: ["#ffe9c3", "#f0d29b"],
} as const;

/** A wrapped candy: rounded centre with two twisted ends. */
export function CandyIcon({ className, tone = "pink" }: CandyIconProps) {
  const gradientId = useId();
  const [light, deep] = TONES[tone];

  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
      </defs>
      <path d="M14 16 4 9v14l10-7Z" fill={deep} opacity={0.85} />
      <path d="M34 16 44 9v14l-10-7Z" fill={deep} opacity={0.85} />
      <ellipse cx="24" cy="16" rx="11" ry="9" fill={`url(#${gradientId})`} />
      <path
        d="M20 9c-2 4-2 10 0 14M27 9c2 4 2 10 0 14"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
