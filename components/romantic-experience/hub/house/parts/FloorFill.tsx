"use client";

import { useId } from "react";
import { FLOOR_STYLES } from "@/lib/house-catalog";

const FLOOR = Object.fromEntries(FLOOR_STYLES.map((f) => [f.id, f]));

/** A floor strip: solid base + a light pattern keyed to the chosen style. */
export function FloorFill({
  floor,
  x,
  y,
  w,
  h,
}: {
  floor: string;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const pid = useId().replace(/:/g, "");
  const def = FLOOR[floor] ?? FLOOR_STYLES[0];

  let pattern: React.ReactNode = null;
  if (def.pattern === "wood") {
    pattern = (
      <pattern id={pid} width={14} height={h} patternUnits="userSpaceOnUse">
        <line x1={0} y1={0} x2={0} y2={h} stroke={def.accent} strokeWidth={1} />
      </pattern>
    );
  } else if (def.pattern === "tile" || def.pattern === "stone") {
    pattern = (
      <pattern id={pid} width={16} height={h} patternUnits="userSpaceOnUse">
        <rect width={16} height={h} fill="none" stroke={def.accent} strokeWidth={0.8} />
      </pattern>
    );
  } else if (def.pattern === "checker") {
    pattern = (
      <pattern id={pid} width={16} height={16} patternUnits="userSpaceOnUse">
        <rect width={8} height={8} fill={def.accent} />
        <rect x={8} y={8} width={8} height={8} fill={def.accent} />
      </pattern>
    );
  } else {
    // carpet — soft speckle
    pattern = (
      <pattern id={pid} width={10} height={10} patternUnits="userSpaceOnUse">
        <circle cx={3} cy={3} r={0.8} fill={def.accent} />
        <circle cx={8} cy={7} r={0.8} fill={def.accent} />
      </pattern>
    );
  }

  return (
    <g>
      <defs>{pattern}</defs>
      <rect x={x} y={y} width={w} height={h} fill={def.base} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${pid})`} opacity={0.55} />
      <rect x={x} y={y} width={w} height={2} fill={def.accent} opacity={0.5} />
    </g>
  );
}
