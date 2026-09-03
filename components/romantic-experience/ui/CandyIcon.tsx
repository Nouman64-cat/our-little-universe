"use client";

import { useId } from "react";

export type CandyTone = "pink" | "lilac" | "honey" | "mint";
export type CandyShape = "wrapped" | "lollipop" | "gummy" | "choc" | "cane";

interface CandyIconProps {
  className?: string;
  tone?: CandyTone;
  shape?: CandyShape;
  /** A rare foil-wrapped candy — adds a gold rim and shine. */
  foil?: boolean;
}

const TONES: Record<CandyTone, readonly [string, string]> = {
  pink: ["#ffd7e8", "#ff9ec4"],
  lilac: ["#e4d7ff", "#c1a6ff"],
  honey: ["#ffe9c3", "#f0d29b"],
  mint: ["#d4f2e4", "#8fd7bd"],
};

/** A single sweet — one of a few shapes, in a candy tone, sometimes foil-wrapped. */
export function CandyIcon({ className, tone = "pink", shape = "wrapped", foil = false }: CandyIconProps) {
  const gid = useId().replace(/:/g, "");
  const [light, deep] = TONES[tone];
  const rim = foil ? "#e9c04a" : "none";
  const rimW = foil ? 1.6 : 0;

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={`g${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={foil ? "#fff2c8" : light} />
          <stop offset="100%" stopColor={foil ? "#ffd15c" : deep} />
        </linearGradient>
      </defs>

      {shape === "lollipop" && (
        <g>
          <rect x={22} y={24} width={4} height={22} rx={2} fill="#efe6d6" stroke="#d9cdb6" strokeWidth={0.8} />
          <circle cx={24} cy={17} r={14} fill={`url(#g${gid})`} stroke={rim} strokeWidth={rimW} />
          <path
            d="M24 17 m0 -11 a11 11 0 0 1 0 22 a7 7 0 0 1 0 -14 a3.5 3.5 0 0 1 0 7"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}

      {shape === "gummy" && (
        <g>
          <path
            d="M24 40 C 8 27 8 12 16.5 12 C 21 12 24 17 24 17 C 24 17 27 12 31.5 12 C 40 12 40 27 24 40Z"
            fill={`url(#g${gid})`}
            stroke={foil ? rim : deep}
            strokeWidth={foil ? rimW : 1}
          />
          <path d="M17 18 q3 -3 5 -1" stroke="rgba(255,255,255,0.55)" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )}

      {shape === "choc" && (
        <g>
          <rect x={9} y={11} width={30} height={26} rx={4} fill={`url(#g${gid})`} stroke={foil ? rim : "#8a5a3c"} strokeWidth={foil ? rimW : 1.2} />
          <path d="M24 11 v26 M9 24 h30" stroke="rgba(120,74,48,0.35)" strokeWidth={1.4} />
          <path d="M12 14 l6 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}

      {shape === "cane" && (
        <g>
          <path
            d="M17 44 V22 a7 7 0 0 1 14 0 v4"
            fill="none"
            stroke={`url(#g${gid})`}
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d="M17 44 V22 a7 7 0 0 1 14 0 v4"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={2}
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
        </g>
      )}

      {shape === "wrapped" && (
        <g>
          <path d="M15 24 4 15v18l11-9Z" fill={foil ? "#f0c85a" : deep} opacity={0.9} />
          <path d="M33 24 44 15v18l-11-9Z" fill={foil ? "#f0c85a" : deep} opacity={0.9} />
          <ellipse cx={24} cy={24} rx={13} ry={10} fill={`url(#g${gid})`} stroke={rim} strokeWidth={rimW} />
          <path
            d="M19 15c-2 5-2 13 0 18M28 15c2 5 2 13 0 18"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {foil && (
        <path d="M14 15 l7 7" stroke="#fff7d8" strokeWidth={2.4} strokeLinecap="round" opacity={0.9} />
      )}
    </svg>
  );
}
