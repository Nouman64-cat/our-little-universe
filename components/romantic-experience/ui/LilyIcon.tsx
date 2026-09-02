"use client";

import { useId } from "react";

interface LilyIconProps {
  className?: string;
  title?: string;
}

/** One symmetric lily petal, base at the origin, tip pointing up. */
const PETAL_PATH = "M0,1 C 9,-11 9,-32 0,-45 C -9,-32 -9,-11 0,1 Z";
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];
/** Stamens sit between the petals. */
const STAMEN_ANGLES = [30, 90, 150, 210, 270, 330];

/**
 * A stylised six-petal lily seen face-on. Blush-to-lavender gradient fill with
 * soft golden stamens. Static — the animated version is `<LilyBloom>`.
 */
export function LilyIcon({ className, title }: LilyIconProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="-50 -50 100 100"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="62%" r="68%">
          <stop offset="0%" stopColor="#fff7fb" />
          <stop offset="55%" stopColor="#f9cfe0" />
          <stop offset="100%" stopColor="#d3b4ff" />
        </radialGradient>
      </defs>

      <g fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.35)" strokeWidth={0.75}>
        {PETAL_ANGLES.map((angle) => (
          <path
            key={angle}
            d={PETAL_PATH}
            transform={`rotate(${angle})`}
            opacity={angle % 120 === 0 ? 0.95 : 0.78}
          />
        ))}
      </g>

      <g stroke="#eec987" strokeWidth={1.4} strokeLinecap="round">
        {STAMEN_ANGLES.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={0}
              y1={0}
              x2={Math.sin(rad) * 15}
              y2={-Math.cos(rad) * 15}
            />
          );
        })}
      </g>
      {STAMEN_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={angle}
            cx={Math.sin(rad) * 16.5}
            cy={-Math.cos(rad) * 16.5}
            r={2.2}
            fill="#e6bd78"
          />
        );
      })}
      <circle cx={0} cy={0} r={3} fill="#ffe9c8" />
    </svg>
  );
}
