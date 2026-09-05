"use client";

import { useId } from "react";
import type { WeatherCondition } from "@/lib/weather";

interface WeatherIconProps {
  condition: WeatherCondition;
  isDay: boolean;
  className?: string;
}

const CLOUD_PATH =
  "M6.5 17.5a4 4 0 0 1-.5-7.97 5 5 0 0 1 9.6-1.98A4.5 4.5 0 0 1 17.5 17.5h-11Z";
const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** A small weather glyph — real conditions, so it uses realistic weather colours, not the site's pink theme. */
export function WeatherIcon({ condition, isDay, className }: WeatherIconProps) {
  const gradientId = useId();

  if (condition === "clear" && !isDay) {
    return (
      <svg viewBox="0 0 24 24" className={className} role="presentation" aria-hidden>
        <path d="M15.8 4.4a8 8 0 1 0 5.8 13A7 7 0 0 1 15.8 4.4Z" fill="#eef0ff" />
      </svg>
    );
  }

  if (condition === "clear") {
    return (
      <svg viewBox="0 0 24 24" className={className} role="presentation" aria-hidden>
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#fff7d6" />
            <stop offset="100%" stopColor="#ffcf6b" />
          </radialGradient>
        </defs>
        <circle cx={12} cy={12} r={5.2} fill={`url(#${gradientId})`} />
        {SUN_RAY_ANGLES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={12 + Math.cos(rad) * 7.4}
              y1={12 + Math.sin(rad) * 7.4}
              x2={12 + Math.cos(rad) * 9.6}
              y2={12 + Math.sin(rad) * 9.6}
              stroke="#ffcf6b"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} role="presentation" aria-hidden>
      <path d={CLOUD_PATH} fill="#c7d0dd" stroke="#9aa6b8" strokeWidth={0.6} />

      {condition === "fog" && (
        <>
          <line x1={4} y1={19.4} x2={20} y2={19.4} stroke="#c7d0dd" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={6} y1={21.7} x2={18} y2={21.7} stroke="#c7d0dd" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        </>
      )}

      {condition === "drizzle" &&
        [8.5, 13].map((x) => (
          <line key={x} x1={x} y1={19} x2={x - 1} y2={21.3} stroke="#8fb4e0" strokeWidth={1.4} strokeLinecap="round" />
        ))}

      {condition === "rain" &&
        [7.5, 11.5, 15.5].map((x) => (
          <line key={x} x1={x} y1={19} x2={x - 1.5} y2={22.2} stroke="#6f9adb" strokeWidth={1.6} strokeLinecap="round" />
        ))}

      {condition === "snow" &&
        [7.5, 12, 16.5].map((x) => (
          <g key={x} stroke="#eaf3fb" strokeWidth={1.3} strokeLinecap="round">
            <line x1={x} y1={19.2} x2={x} y2={22.2} />
            <line x1={x - 1.3} y1={19.9} x2={x + 1.3} y2={21.5} />
            <line x1={x + 1.3} y1={19.9} x2={x - 1.3} y2={21.5} />
          </g>
        ))}

      {condition === "storm" && (
        <path d="M13.4 18.2 10.6 22.3h2.3l-1.3 3.2 4-5.3h-2.3l1.3-2Z" fill="#ffd76b" />
      )}
    </svg>
  );
}
