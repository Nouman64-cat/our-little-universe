"use client";

import { useId } from "react";
import {
  LILY_VIEWBOX,
  LilyCentre,
  LilyGradient,
  LilyPetal,
  PETAL_ANGLES,
  isInnerPetal,
  type LilyTone,
} from "../lily-shape";

interface LilyIconProps {
  className?: string;
  title?: string;
  /** Petal colouring — a speckled pink stargazer by default, or a cream lily. */
  tone?: LilyTone;
}

/**
 * A stargazer lily seen face-on: two whorls of long pointed tepals with a
 * speckled throat and a burst of rust-anther stamens. Static — the animated
 * version is `<LilyBloom>`.
 */
export function LilyIcon({ className, title, tone = "blush" }: LilyIconProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox={LILY_VIEWBOX}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <LilyGradient id={gradientId} tone={tone} />
      </defs>

      {/* outer whorl behind, inner whorl in front */}
      {PETAL_ANGLES.map((angle, index) =>
        isInnerPetal(index) ? null : (
          <g key={angle} transform={`rotate(${angle})`}>
            <LilyPetal index={index} gradientId={gradientId} tone={tone} />
          </g>
        ),
      )}
      {PETAL_ANGLES.map((angle, index) =>
        isInnerPetal(index) ? (
          <g key={angle} transform={`rotate(${angle})`}>
            <LilyPetal index={index} gradientId={gradientId} tone={tone} />
          </g>
        ) : null,
      )}

      <LilyCentre />
    </svg>
  );
}
