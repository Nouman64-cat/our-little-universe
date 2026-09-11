"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import type { FenceStyle, GateStyle, PathStyle } from "@/lib/garden-decor";

/**
 * The garden's built structure — fence, gate and path — as flat illustration
 * SVGs on a fixed hex palette (like the rest of `GardenScene`, they don't
 * follow the theme; the scene's dark scrim keeps them legible on any sky).
 *
 * Each piece exports a raw art component (sized by its container, used for the
 * editor previews) plus a positioned wrapper the scene drops in place.
 */

const WOOD = { light: "#f3ecdd", mid: "#e4d8bf", dark: "#c9b994", rail: "#d8c9a8" };
const STONE = { light: "#d0cabb", mid: "#b7ad98", dark: "#968b76" };
const HEDGE = { dark: "#3c7d49", mid: "#4f9a5c", light: "#6bb673" };
const IRON = "#26262c";
const BRICK = { face: "#b17c62", dark: "#986851", mortar: "#e4d8c2" };
const GRAVEL = { fill: "#e8e1d0", spec: "#c7bca0", edge: "#b7ad95" };
const BLOOM = "#f6dbe6";

// ── fence ───────────────────────────────────────────────────────────────────

const FENCE_TILE: Record<Exclude<FenceStyle, "none">, { w: number; h: number }> = {
  picket: { w: 18, h: 48 },
  rail: { w: 58, h: 40 },
  lattice: { w: 20, h: 44 },
  stone: { w: 34, h: 28 },
  hedge: { w: 32, h: 36 },
};

function fenceTile(variant: Exclude<FenceStyle, "none">): ReactNode {
  switch (variant) {
    case "picket":
      return (
        <>
          <rect x={0} y={16} width={18} height={4} fill={WOOD.dark} />
          <rect x={0} y={34} width={18} height={4} fill={WOOD.dark} />
          <path d="M3 10 L9 1 L15 10 V48 H3 Z" fill={WOOD.light} />
          <path d="M13 10 L15 10 V48 H13 Z" fill={WOOD.mid} />
        </>
      );
    case "rail":
      return (
        <>
          <rect x={0} y={9} width={58} height={6} rx={3} fill={WOOD.rail} />
          <rect x={0} y={23} width={58} height={6} rx={3} fill={WOOD.rail} />
          <rect x={2} y={2} width={8} height={38} rx={2} fill={WOOD.light} />
          <rect x={8} y={2} width={2} height={38} fill={WOOD.dark} opacity={0.6} />
        </>
      );
    case "lattice":
      return (
        <>
          <path
            d="M0 44 L20 24 M0 24 L20 44 M0 24 L20 4 M0 4 L20 24"
            stroke={WOOD.mid}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <rect x={0} y={0} width={20} height={5} fill={WOOD.light} />
        </>
      );
    case "stone":
      return (
        <>
          <ellipse cx={8} cy={22} rx={9} ry={7} fill={STONE.mid} />
          <ellipse cx={25} cy={23} rx={10} ry={7} fill={STONE.dark} />
          <ellipse cx={17} cy={13} rx={9} ry={7} fill={STONE.light} />
          <ellipse cx={2} cy={12} rx={7} ry={6} fill={STONE.mid} />
          <ellipse cx={33} cy={12} rx={7} ry={6} fill={STONE.light} />
        </>
      );
    case "hedge":
      return (
        <>
          <rect x={0} y={14} width={32} height={22} fill={HEDGE.dark} />
          <ellipse cx={7} cy={16} rx={10} ry={9} fill={HEDGE.mid} />
          <ellipse cx={22} cy={14} rx={12} ry={10} fill={HEDGE.mid} />
          <ellipse cx={14} cy={11} rx={9} ry={8} fill={HEDGE.light} opacity={0.8} />
          <ellipse cx={29} cy={18} rx={8} ry={7} fill={HEDGE.light} opacity={0.5} />
        </>
      );
  }
}

/** One horizontal run of fence, tiled to whatever width its box gives it. */
export function FenceRun({
  variant,
  className,
  style,
}: {
  variant: Exclude<FenceStyle, "none">;
  className?: string;
  style?: CSSProperties;
}) {
  const rawId = useId();
  const id = `fence-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const { w, h } = FENCE_TILE[variant];
  return (
    <svg
      aria-hidden
      className={className}
      style={{ display: "block", height: h, width: "100%", ...style }}
    >
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={h}>
          {fenceTile(variant)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Two fence runs with a gap in the middle for the gate. Scene wrapper. */
export function Fence({ variant }: { variant: FenceStyle }) {
  if (variant === "none") return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{ transform: "translateY(-42%)" }}
    >
      <FenceRun
        variant={variant}
        className="absolute left-0"
        style={{ right: "calc(50% + 42px)" }}
      />
      <FenceRun
        variant={variant}
        className="absolute right-0"
        style={{ left: "calc(50% + 42px)" }}
      />
    </div>
  );
}

// ── gate ────────────────────────────────────────────────────────────────────

const GATE_VB: Record<Exclude<GateStyle, "none">, string> = {
  arch: "0 0 96 118",
  picket: "0 0 96 60",
  iron: "0 0 96 74",
};

function gateArt(variant: Exclude<GateStyle, "none">): ReactNode {
  switch (variant) {
    case "arch":
      return (
        <>
          <path
            d="M14 118 V46 A34 34 0 0 1 82 46 V118"
            fill="none"
            stroke={WOOD.light}
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d="M22 118 V46 A26 26 0 0 1 74 46 V118"
            fill="none"
            stroke={WOOD.mid}
            strokeWidth={3}
          />
          {/* climbing greenery + a few white lilies */}
          {[
            [14, 92],
            [18, 64],
            [30, 34],
            [48, 20],
            [66, 34],
            [78, 64],
            [82, 96],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={9} ry={6} fill={HEDGE.mid} />
              <ellipse cx={x + 3} cy={y - 3} rx={5} ry={4} fill={HEDGE.light} />
              {i % 2 === 0 && <circle cx={x} cy={y} r={3.4} fill={BLOOM} />}
            </g>
          ))}
          {/* low picket gate under the arch */}
          <rect x={26} y={86} width={44} height={32} rx={2} fill={WOOD.light} />
          <rect x={26} y={92} width={44} height={4} fill={WOOD.dark} opacity={0.5} />
          <path d="M28 116 L68 90" stroke={WOOD.dark} strokeWidth={3} opacity={0.5} />
          {[32, 42, 52, 62].map((x) => (
            <rect key={x} x={x} y={86} width={5} height={32} fill={WOOD.mid} />
          ))}
        </>
      );
    case "picket":
      return (
        <>
          <rect x={4} y={6} width={88} height={50} rx={2} fill={WOOD.light} />
          <rect x={4} y={14} width={88} height={5} fill={WOOD.dark} opacity={0.5} />
          <rect x={4} y={40} width={88} height={5} fill={WOOD.dark} opacity={0.5} />
          <path d="M8 54 L88 10" stroke={WOOD.dark} strokeWidth={4} opacity={0.45} />
          {[12, 26, 40, 54, 68, 82].map((x) => (
            <path
              key={x}
              d={`M${x} 8 L${x + 5} 2 L${x + 10} 8 V56 H${x} Z`}
              fill={WOOD.mid}
            />
          ))}
        </>
      );
    case "iron":
      return (
        <g stroke={IRON} fill="none" strokeLinecap="round">
          {[7, 25, 43, 61, 79].map((x) => (
            <g key={x} strokeWidth={4}>
              <path d={`M${x} 70 V16`} />
              <path d={`M${x} 6 L${x - 5} 14 M${x} 6 L${x + 5} 14`} />
            </g>
          ))}
          <path d="M1 24 H91 M1 56 H91" strokeWidth={4} />
          {[7, 43].map((x) => (
            <path
              key={x}
              d={`M${x} 56 q9 -13 18 0 M${x + 18} 56 q9 -13 18 0`}
              strokeWidth={3}
            />
          ))}
          <path d="M43 70 V6" strokeWidth={4.5} />
        </g>
      );
  }
}

/** The gate art, sized by its container (used for editor previews). */
export function GateArt({
  variant,
  className,
}: {
  variant: Exclude<GateStyle, "none">;
  className?: string;
}) {
  return (
    <svg
      viewBox={GATE_VB[variant]}
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      {gateArt(variant)}
    </svg>
  );
}

/** The gate, centred on the fence line. Scene wrapper. */
export function Gate({ variant }: { variant: GateStyle }) {
  if (variant === "none") return null;
  const tall = variant === "arch";
  return (
    <div
      aria-hidden
      // left:50% + a bare inline transform (no Tailwind `-translate-x`
      // utility, which in v4 is a separate `translate` property that would
      // stack with this and double the shift)
      className="pointer-events-none absolute left-1/2"
      style={{
        top: 0,
        width: 96,
        transform: `translate(-50%, ${tall ? "-64%" : "-46%"})`,
      }}
    >
      <GateArt variant={variant} className="h-auto w-full" />
    </div>
  );
}

// ── path ────────────────────────────────────────────────────────────────────

const PATH_TILE: Record<Exclude<PathStyle, "none">, { w: number; h: number }> = {
  stone: { w: 60, h: 40 },
  brick: { w: 44, h: 20 },
  gravel: { w: 40, h: 34 },
  stepping: { w: 40, h: 52 },
};

function pathTile(variant: Exclude<PathStyle, "none">): ReactNode {
  switch (variant) {
    case "stone":
      return (
        <>
          <rect x={0} y={0} width={60} height={40} fill={STONE.dark} />
          <path
            d="M4 4 h22 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 v-11 a3 3 0 0 1 0 -6 Z"
            fill={STONE.light}
          />
          <path
            d="M34 4 h22 v13 a4 4 0 0 1 -4 4 h-17 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 3 -4 Z"
            fill={STONE.mid}
          />
          <path
            d="M5 25 h20 a4 4 0 0 1 4 4 v8 h-27 v-8 a4 4 0 0 1 3 -4 Z"
            fill={STONE.mid}
          />
          <path d="M33 25 h23 v12 h-27 v-8 a4 4 0 0 1 4 -4 Z" fill={STONE.light} />
        </>
      );
    case "brick":
      return (
        <>
          <rect x={0} y={0} width={44} height={20} fill={BRICK.mortar} />
          {[2, 12].map((y, row) =>
            [-8, 10, 28].map((x0) => {
              const x = x0 + (row ? 9 : 0);
              return (
                <rect
                  key={`${row}-${x0}`}
                  x={x}
                  y={y}
                  width={16}
                  height={7}
                  rx={1}
                  fill={(Math.round(x0 / 9) + row) % 2 ? BRICK.face : BRICK.dark}
                />
              );
            }),
          )}
        </>
      );
    case "gravel":
      return (
        <>
          <rect x={0} y={0} width={40} height={34} fill={GRAVEL.fill} />
          {[
            [7, 6],
            [17, 16],
            [27, 5],
            [33, 22],
            [12, 27],
            [24, 30],
            [4, 19],
            [35, 12],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 1.3 : 2} fill={GRAVEL.spec} />
          ))}
        </>
      );
    case "stepping":
      return (
        <>
          <ellipse cx={14} cy={13} rx={13} ry={9} fill={STONE.light} />
          <ellipse cx={14} cy={13} rx={13} ry={9} fill={STONE.dark} opacity={0.15} />
          <ellipse cx={30} cy={39} rx={12} ry={8} fill={STONE.mid} />
        </>
      );
  }
}

/** One column of path surface, tiled down whatever height its box gives it. */
export function PathRun({
  variant,
  className,
  style,
}: {
  variant: Exclude<PathStyle, "none">;
  className?: string;
  style?: CSSProperties;
}) {
  const rawId = useId();
  const id = `path-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const { w, h } = PATH_TILE[variant];
  return (
    <svg
      aria-hidden
      className={className}
      style={{ display: "block", height: "100%", width: "100%", ...style }}
    >
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={h}>
          {pathTile(variant)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <rect
        width="100%"
        height="100%"
        fill="none"
        stroke="rgba(60, 44, 30, 0.15)"
        strokeWidth={5}
      />
    </svg>
  );
}

/**
 * Geometry of the trapezoid `Pathway` draws — centered, 34% of the bed's
 * width (capped at 132px), 94% tall, anchored to the bottom, narrower at the
 * back than the front. Kept in lockstep with the JSX below so planting logic
 * can ask "is this spot on the path" without duplicating the shape by eye.
 */
const PATH_WIDTH_FRACTION = 0.34;
const PATH_MAX_WIDTH = 132;
const PATH_HEIGHT_FRACTION = 0.94;
/** clip-path left/right inset at the back edge (26% / 74%). */
const PATH_BACK_INSET = 0.26;

/**
 * Whether a normalised bed spot (`x`/`y` each 0–1, matching `GardenLily`)
 * falls on the path, so the garden can keep flowers off it. `containerWidth`
 * / `containerHeight` are the bed's actual pixel size (the path's max-width
 * cap means its on-screen shape isn't a fixed fraction of the bed).
 */
export function isOnPath(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number,
  variant: PathStyle,
): boolean {
  if (variant === "none" || !containerWidth || !containerHeight) return false;
  const widthPx = Math.min(containerWidth * PATH_WIDTH_FRACTION, PATH_MAX_WIDTH);
  const heightPx = containerHeight * PATH_HEIGHT_FRACTION;
  const leftPx = (containerWidth - widthPx) / 2;
  const topPx = containerHeight - heightPx; // bottom-anchored
  const boxX = (x * containerWidth - leftPx) / widthPx;
  const boxY = (y * containerHeight - topPx) / heightPx;
  if (boxY < 0 || boxY > 1) return false;
  const leftEdge = PATH_BACK_INSET * (1 - boxY);
  const rightEdge = 1 - PATH_BACK_INSET * (1 - boxY);
  return boxX >= leftEdge && boxX <= rightEdge;
}

/** The path running from the front of the bed up to the gate. Scene wrapper. */
export function Pathway({ variant }: { variant: PathStyle }) {
  if (variant === "none") return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        width: "34%",
        maxWidth: 132,
        height: "94%",
        // a touch of perspective — wider at the front, tapering to the gate
        clipPath: "polygon(26% 0, 74% 0, 100% 100%, 0% 100%)",
        filter: "drop-shadow(0 -2px 6px rgba(0,0,0,0.16))",
        opacity: 0.94,
      }}
    >
      <PathRun variant={variant} />
    </div>
  );
}
