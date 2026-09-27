"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";
import { clamp } from "@/lib/utils";
import { usePanZoom } from "@/hooks/usePanZoom";
import { hashString, skyPhase, sunProgress, type SkyPhase } from "@/lib/daily";
import { FLOWER_LABEL } from "@/lib/flowers";
import { bedUnits, type GardenDecor, type PathStyle } from "@/lib/garden-decor";
import { FlowerArt } from "../flowers";
import { Fence, Gate, isOnPath, Pathway } from "../garden-decor";
import type { LilyTone } from "../lily-shape";
import type { GardenLily } from "./keepsake-context";

/** Sky / ground palette per time of day. */
const SCENERY: Record<
  SkyPhase,
  {
    sky: string;
    grass: string;
    grassLip: string;
    orb: string;
    orbGlow: string;
    cloud: string;
    /** Foreground grass-blade fringe + background shrubs. */
    bladeLight: string;
    bladeDark: string;
    bush: string;
    /** Contact shadow the flowers cast on the bed. */
    shadow: string;
  }
> = {
  dawn: {
    sky: "linear-gradient(180deg, #f7cba8 0%, #edb9d0 44%, #c3d7ea 100%)",
    grass: "linear-gradient(180deg, #9ad39a 0%, #5faa68 100%)",
    grassLip: "#7cc47f",
    orb: "#fff1d6",
    orbGlow: "rgba(255, 214, 160, 0.75)",
    cloud: "rgba(255,255,255,0.82)",
    bladeLight: "#6fb974",
    bladeDark: "#4a8f57",
    bush: "#4f9a5f",
    shadow: "rgba(40, 70, 45, 0.28)",
  },
  day: {
    sky: "linear-gradient(180deg, #8ec7ea 0%, #bfe1f1 52%, #e9f5fb 100%)",
    grass: "linear-gradient(180deg, #93d18f 0%, #57a862 100%)",
    grassLip: "#74c079",
    orb: "#fff7e4",
    orbGlow: "rgba(255, 233, 178, 0.85)",
    cloud: "rgba(255,255,255,0.9)",
    bladeLight: "#63bd6d",
    bladeDark: "#3f9a52",
    bush: "#48ab5b",
    shadow: "rgba(35, 65, 40, 0.26)",
  },
  dusk: {
    sky: "linear-gradient(180deg, #f4a978 0%, #dd83a7 38%, #7f6aa8 74%, #4b4374 100%)",
    grass: "linear-gradient(180deg, #75a279 0%, #45704d 100%)",
    grassLip: "#5f9166",
    orb: "#ffe0b0",
    orbGlow: "rgba(255, 176, 120, 0.7)",
    cloud: "rgba(255,255,255,0.5)",
    bladeLight: "#5b8a63",
    bladeDark: "#3c6547",
    bush: "#456f4d",
    shadow: "rgba(20, 35, 25, 0.34)",
  },
  night: {
    sky: "linear-gradient(180deg, #131a3d 0%, #23224f 55%, #322f5e 100%)",
    grass: "linear-gradient(180deg, #33503f 0%, #1f3630 100%)",
    grassLip: "#3c5a48",
    orb: "#eef0ff",
    orbGlow: "rgba(200, 208, 255, 0.55)",
    cloud: "rgba(210,214,240,0.14)",
    bladeLight: "#3a5c44",
    bladeDark: "#233b2e",
    bush: "#2a4636",
    shadow: "rgba(0, 0, 0, 0.32)",
  },
};

/**
 * Fixed cloud layout. `from`/`to` are translateX as a fraction of the scene
 * width (the track spans it), `rest` is where a still frame parks the cloud.
 */
const CLOUDS = [
  { top: "13%", size: 104, from: "-35%", to: "115%", rest: "18%", duration: 48, delay: 0, opacity: 1 },
  { top: "31%", size: 66, from: "110%", to: "-45%", rest: "62%", duration: 64, delay: 5, opacity: 0.8 },
  { top: "5%", size: 52, from: "40%", to: "150%", rest: "78%", duration: 55, delay: 2, opacity: 0.65 },
] as const;

/** Fixed star field for the night sky. */
const STARS = [
  { x: "12%", y: "18%", r: 1.4, delay: 0 },
  { x: "24%", y: "40%", r: 1, delay: 1.2 },
  { x: "37%", y: "12%", r: 1.6, delay: 0.5 },
  { x: "48%", y: "30%", r: 1, delay: 2 },
  { x: "58%", y: "16%", r: 1.3, delay: 0.9 },
  { x: "69%", y: "38%", r: 1, delay: 1.7 },
  { x: "78%", y: "10%", r: 1.5, delay: 0.3 },
  { x: "86%", y: "28%", r: 1, delay: 2.4 },
  { x: "31%", y: "24%", r: 0.8, delay: 1.5 },
  { x: "64%", y: "26%", r: 0.9, delay: 0.7 },
  { x: "91%", y: "16%", r: 1.1, delay: 1.9 },
  { x: "17%", y: "31%", r: 1, delay: 2.6 },
] as const;

/** One plot's width on screen and the bed's height, in px. */
interface BedMetrics {
  plotWidth: number;
  height: number;
}

/** How the bed maps a flower's (x, y) — `x` in plot units — to pixels from
 *  its left / top. Mirrors the inline style each flower gets further down, so
 *  spot-finding can predict where a candidate position would actually land. */
function bedPixel(x: number, y: number, { plotWidth, height }: BedMetrics) {
  return {
    px: plotWidth * (0.06 + x * 0.88),
    py: height * (0.04 + (1 - y) * 0.52),
  };
}

/** Closest two flowers can sit before they'd render on top of one another. */
const MIN_FLOWER_GAP_PX = 30;

function collidesWithBloom(
  x: number,
  y: number,
  blooms: GardenLily[],
  bed: BedMetrics,
): boolean {
  const a = bedPixel(x, y, bed);
  return blooms.some((bloom) => {
    const b = bedPixel(bloom.x, bloom.y, bed);
    return Math.hypot(a.px - b.px, a.py - b.py) < MIN_FLOWER_GAP_PX;
  });
}

/**
 * Resolve a tapped bed spot to somewhere plantable: never on the path, and
 * never so close to an existing flower that the two would collapse into one
 * clump. Starts at the tapped spot and spirals outward until it finds a free
 * one, falling back to the tap itself if the bed is packed solid.
 */
function findPlantSpot(
  x: number,
  y: number,
  blooms: GardenLily[],
  bed: BedMetrics,
  path: PathStyle,
  plots: number,
): { x: number; y: number } {
  // the path lives in the home plot, so it's tested in that plot's frame
  const isFree = (px: number, py: number) =>
    !isOnPath(0.06 + px * 0.88, py, bed.plotWidth, bed.height, path) &&
    !collidesWithBloom(px, py, blooms, bed);

  if (isFree(x, y)) return { x, y };

  for (let radius = 0.04; radius <= 0.5; radius += 0.04) {
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      const px = clamp(x + Math.cos(rad) * radius, 0.02, plots - 0.02);
      // the bed reads much shallower front-to-back than side-to-side
      const py = clamp(y + Math.sin(rad) * radius * 0.6, 0.06, 0.96);
      if (isFree(px, py)) return { x: px, y: py };
    }
  }
  return { x, y };
}

/** A leafed lily stem, grown from the bed. Group-local, base at y = height. */
function Stem({
  height,
  fresh,
  reduceMotion,
}: {
  height: number;
  fresh: boolean;
  reduceMotion: boolean;
}) {
  const leaves = useMemo(() => {
    const out: { y: number; side: 1 | -1; len: number }[] = [];
    for (let y = height * 0.34, i = 0; y < height * 0.92; y += 12, i += 1) {
      out.push({ y, side: i % 2 === 0 ? 1 : -1, len: 15 + ((i * 7) % 7) });
    }
    return out;
  }, [height]);

  return (
    <motion.svg
      width={46}
      height={height}
      viewBox={`-23 0 46 ${height}`}
      className="overflow-visible"
      style={{ transformOrigin: "bottom center" }}
      initial={reduceMotion || !fresh ? false : { scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.7, ease: EASE_SOFT }}
      aria-hidden
    >
      <path
        d={`M0,${height} C -2.5,${height * 0.62} 2.5,${height * 0.3} 0,0`}
        fill="none"
        stroke="var(--color-leaf)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => (
        <path
          key={i}
          d="M0,0 C 8,-6 19,-7 28,-1 C 19,4 8,4 0,0 Z"
          fill="var(--color-leaf)"
          opacity={i % 2 === 0 ? 0.92 : 0.72}
          transform={`translate(0 ${height - leaf.y}) scale(${leaf.side} 1) rotate(-24) scale(${leaf.len / 22})`}
        />
      ))}
    </motion.svg>
  );
}

/** One lily on a leafed stem, rooted in the grass at its spot in the bed. */
function Flower({
  bloom,
  fresh,
  reduceMotion,
  shadow,
  onOpen,
}: {
  bloom: GardenLily;
  fresh: boolean;
  reduceMotion: boolean;
  shadow: string;
  onOpen: () => void;
}) {
  const stemHeight = 32 + (hashString(bloom.id) % 30);
  const size = 40 + (hashString(`${bloom.id}s`) % 16);
  const lean = (hashString(`${bloom.id}l`) % 9) - 4;
  // lily only — the others carry their own colour
  const tone: LilyTone = hashString(`${bloom.id}t`) % 4 === 0 ? "white" : "blush";

  return (
    <motion.button
      type="button"
      // pointer taps are routed through the scene's pan-zoom tap handler;
      // this only needs to answer keyboard activation (detail 0)
      onClick={(event) => {
        if (event.detail === 0) onOpen();
      }}
      aria-label={`${FLOWER_LABEL[bloom.species]} from ${bloom.label}`}
      className="group relative flex shrink-0 flex-col items-center rounded-xl px-0.5 pt-1 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
      style={{ transformOrigin: "bottom center", rotate: `${lean}deg` }}
      initial={
        reduceMotion || !fresh
          ? { opacity: 0 }
          : { opacity: 0, y: 12, scale: 0.75 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: fresh ? 1 : 0.4, ease: EASE_SOFT }}
    >
      <motion.span
        className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.22)]"
        style={{ width: size, height: size }}
        animate={
          reduceMotion ? undefined : { rotate: [-1.3, 1.6, -1.3], y: [0, -1.5, 0] }
        }
        transition={{
          duration: 5 + (hashString(bloom.id) % 4),
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <FlowerArt
          species={bloom.species}
          className="h-full w-full"
          fresh={fresh}
          tone={tone}
        />
      </motion.span>

      <Stem height={stemHeight} fresh={fresh} reduceMotion={reduceMotion} />

      {/* contact shadow on the bed */}
      <span
        aria-hidden
        className="absolute bottom-1.5 rounded-[50%] blur-[3px]"
        style={{ width: size * 0.62, height: 6, background: shadow }}
      />
    </motion.button>
  );
}

interface GardenSceneProps {
  blooms: GardenLily[];
  freshId: string | null;
  emptyLine: string;
  /** aria-label for the plantable bed ("plant a rose"). */
  plantLabel: string;
  /** The fence / gate / path she's styled, and how many plots of land. */
  decor: GardenDecor;
  /** Whether there's room to add another plot (shows the signpost). */
  canExpand: boolean;
  /** aria-label / caption for the "more land" signpost. */
  expandLabel: string;
  onOpen: (bloom: GardenLily) => void;
  /** She tapped an empty spot in the bed — grow a flower there (`x` in plot
   *  units, `y` 0–1). */
  onPlant: (x: number, y: number) => void;
  /** She tapped the signpost at the far end — add a plot of land. */
  onExpand: () => void;
}

/**
 * The garden itself: a sky that shifts with the actual time of day, a drifting
 * sun or moon, slow clouds, background shrubs, a grassy bank the flowers grow
 * out of, and a fringe of grass blades across the foreground. The flowers are
 * scattered naturally across the bed rather than lined up; tapping an empty
 * patch of grass plants a new one right there. The bed spans `decor.plots`
 * plots side by side — wider than the screen once she's added land, so she
 * swipes along it — with a signpost at the far end that adds another. Every
 * animation drops to a still frame when motion is reduced.
 */
export function GardenScene({
  blooms,
  freshId,
  emptyLine,
  plantLabel,
  decor,
  canExpand,
  expandLabel,
  onOpen,
  onPlant,
  onExpand,
}: GardenSceneProps) {
  const reduceMotion = useReducedMotion();
  const bedRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const { plots } = decor;
  const units = bedUnits(plots);

  /** The bed's on-screen metrics (already scaled by the pan-zoom). */
  const measureBed = useCallback(() => {
    const rect = bedRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { rect, plotWidth: rect.width / units, height: rect.height };
  }, [units]);

  /**
   * Resolve a normalised bed position to a plantable one (off the path,
   * clear of existing flowers) and hand it to the caller.
   */
  const resolveAndPlant = useCallback(
    (x: number, y: number) => {
      const bed = measureBed();
      if (!bed) return;
      const spot = findPlantSpot(x, y, blooms, bed, decor.path, plots);
      onPlant(spot.x, spot.y);
    },
    [blooms, decor.path, measureBed, onPlant, plots],
  );

  /** Turn a spot in the bed (client coords) into a normalised plant position. */
  const plantAt = useCallback(
    (clientX: number, clientY: number) => {
      const bed = measureBed();
      if (!bed) return;
      // invert the flower placement (`0.06 + x * 0.88` plot-widths in)
      const x = clamp(
        ((clientX - bed.rect.left) / bed.plotWidth - 0.06) / 0.88,
        0.02,
        plots - 0.02,
      );
      // top of the bed reads as the back of the border, bottom as the front
      const y = clamp((clientY - bed.rect.top) / bed.height, 0.06, 0.96);
      resolveAndPlant(x, y);
    },
    [measureBed, plots, resolveAndPlant],
  );

  /**
   * A tap that landed on a flower opens its note; anywhere else on the bed
   * plants one. `getBoundingClientRect` already accounts for the pan-zoom
   * transform, so this stays accurate at any zoom.
   */
  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY);
      if (target?.closest("[data-garden-expand]")) {
        onExpand();
        return;
      }
      const hit = target?.closest<HTMLElement>("[data-flower-id]");
      if (hit) {
        const bloom = blooms.find((b) => b.id === hit.dataset.flowerId);
        if (bloom) onOpen(bloom);
        return;
      }
      plantAt(clientX, clientY);
    },
    [blooms, onExpand, onOpen, plantAt],
  );

  const { scale, x: panX, viewportProps, worldStyle, zoomBy, reset, panToEnd } =
    usePanZoom(viewportRef, {
      minScale: 1,
      maxScale: 4,
      anchorY: 0.3,
      worldRef,
      onTap: handleTap,
    });

  // New land → slide over to show it (after the wider bed has laid out).
  const shownPlots = useRef(plots);
  useEffect(() => {
    if (plots <= shownPlots.current) {
      shownPlots.current = plots;
      return;
    }
    shownPlots.current = plots;
    const frame = requestAnimationFrame(panToEnd);
    return () => cancelAnimationFrame(frame);
  }, [plots, panToEnd]);

  const { phase, scene, sun } = useMemo(() => {
    const now = new Date();
    const phase = skyPhase(now);
    const p = sunProgress(now);
    return {
      phase,
      scene: SCENERY[phase],
      sun: {
        left: `${8 + p * 72}%`,
        top: `${232 + (1 - Math.sin(p * Math.PI)) * 150}px`,
      },
    };
  }, []);

  const isNight = phase === "night";

  return (
    <>
    <div
      ref={viewportRef}
      {...viewportProps}
      className="absolute inset-0 touch-none select-none overflow-hidden"
      // `cqw` below = this viewport's width
      style={{ containerType: "inline-size" }}
    >
      {/* sky — outside the pan-zoom world, so it stays put like a real sky
          while she swipes along the garden */}
      <div className="absolute inset-0" style={{ background: scene.sky }} />

      {/* sky band — celestial elements live here so they stay put as the
          grass below grows with more lilies */}
      <div className="absolute inset-x-0 top-0 h-[56%] overflow-hidden">
        {/* stars */}
        {isNight &&
          STARS.map((star, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: star.x,
                top: star.y,
                width: star.r * 2,
                height: star.r * 2,
              }}
              animate={
                reduceMotion ? { opacity: 0.7 } : { opacity: [0.25, 0.9, 0.25] }
              }
              transition={{
                duration: 3.5,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

        {/* sun / moon */}
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: sun.left,
            top: sun.top,
            width: 52,
            height: 52,
            background: scene.orb,
            boxShadow: `0 0 42px 14px ${scene.orbGlow}`,
          }}
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          {isNight && (
            <span
              className="absolute rounded-full"
              style={{ right: 4, top: 3, width: 42, height: 42, background: "#1a2145" }}
            />
          )}
        </motion.span>

        {/* clouds — each rides a full-width track so translateX reads as a
            fraction of the scene */}
        {CLOUDS.map((cloud, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: cloud.top, opacity: cloud.opacity }}
            animate={reduceMotion ? { x: cloud.rest } : { x: [cloud.from, cloud.to] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: cloud.duration,
                    delay: cloud.delay,
                    repeat: Infinity,
                    ease: "linear",
                  }
            }
          >
            <Cloud size={cloud.size} fill={scene.cloud} />
          </motion.div>
        ))}
      </div>

    {/* the world: ground + bed. One plot fits the screen; each added plot
        makes it wider, left-aligned so the home plot is where she starts. */}
    <div
      ref={worldRef}
      className="absolute inset-y-0 left-0 origin-center"
      style={{
        ...worldStyle,
        ["--plot" as string]: "min(100cqw - 2rem, 28rem)",
        width: `max(100cqw, calc(var(--plot) * ${units} + 2rem))`,
      }}
    >

      {/* ground — anchored to the bottom; the planting bed sits just above the
          controls, its flowers scattered across it like a real border */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col justify-end rounded-t-[50%/46px] px-4 pt-10 pb-[calc(env(safe-area-inset-bottom)+11.5rem)]"
        style={{
          background: scene.grass,
          boxShadow: `inset 0 3px 0 ${scene.grassLip}, 0 -14px 34px -12px rgba(0,0,0,0.28)`,
          minHeight: "54%",
        }}
      >
        <div
          className="relative mx-auto h-[clamp(11rem,30vh,16rem)]"
          style={{ width: `calc(var(--plot) * ${units})` }}
        >
          {/* the home plot — gate, path and the first-flower hint live here */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0"
            style={{ width: `${100 / units}%` }}
          >
            {/* the path she's laid, on the ground under the flowers */}
            <Pathway variant={decor.path} />
            <Gate variant={decor.gate} />
            {blooms.length === 0 && (
              <p className="absolute inset-x-0 bottom-8 z-30 text-center text-sm text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
                {emptyLine}
              </p>
            )}
          </div>

          {/* shrubs along the back of each plot */}
          {Array.from({ length: plots }, (_, i) => (
            <div
              key={i}
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${((0.88 * i) / units) * 100}%`,
                width: `${100 / units}%`,
                transform: i % 2 === 1 ? "scaleX(-1)" : undefined,
              }}
            >
              <Bushes light={scene.bladeLight} dark={scene.bush} />
            </div>
          ))}

          {/* her fence along the back edge, behind the flowers, opening
              for the gate in the home plot */}
          <Fence variant={decor.fence} gapAt={`${(0.5 / units) * 100}%`} />

          {/* the far end: a little signpost that adds another plot */}
          {canExpand && (
            <ExpandSign label={expandLabel} onExpand={onExpand} />
          )}

          {/* the plantable bed — pointer taps run through the scene's tap
              handler; this answers keyboard activation and is the rect that
              plant positions are measured against */}
          <button
            ref={bedRef}
            type="button"
            aria-label={plantLabel}
            onClick={(event) => {
              if (event.detail === 0) resolveAndPlant(0.5, 0.55);
            }}
            className="absolute inset-0 z-0 rounded-[45%/22%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/50"
          />

          {blooms.map((bloom) => {
            // nearer the front → a touch bigger and layered over the ones behind
            const depth = 0.76 + bloom.y * 0.36;
            return (
              <div
                key={bloom.id}
                data-flower-id={bloom.id}
                className="absolute"
                style={{
                  left: `${((0.06 + bloom.x * 0.88) / units) * 100}%`,
                  bottom: `${4 + (1 - bloom.y) * 52}%`,
                  transform: `translateX(-50%) scale(${depth})`,
                  transformOrigin: "bottom center",
                  // depth order only, kept well below the note overlay (z-50)
                  zIndex: 1 + Math.round(bloom.y * 24),
                }}
              >
                <Flower
                  bloom={bloom}
                  fresh={bloom.id === freshId}
                  reduceMotion={!!reduceMotion}
                  shadow={scene.shadow}
                  onOpen={() => onOpen(bloom)}
                />
              </div>
            );
          })}

          {/* grass tufting up around the stems, one fringe per plot */}
          {Array.from({ length: plots }, (_, i) => (
            <div
              key={i}
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${((0.88 * i) / units) * 100}%`,
                width: `${100 / units}%`,
              }}
            >
              <GrassFringe
                light={scene.bladeLight}
                dark={scene.bladeDark}
                reduceMotion={!!reduceMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>

    <ZoomControls
      scale={scale}
      away={scale > 1.01 || panX < -4}
      onZoomIn={() => zoomBy(1.6)}
      onZoomOut={() => zoomBy(1 / 1.6)}
      onReset={reset}
    />
    </>
  );
}

/** ＋ / − / reset stack, floated top-left over the scene (outside the zoom world). */
function ZoomControls({
  scale,
  away,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  scale: number;
  /** Zoomed in or swiped along — offer the way back to the gate. */
  away: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-lg leading-none text-white/90 backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 disabled:opacity-35";
  return (
    <div className="absolute left-3 top-[calc(env(safe-area-inset-top)+1rem)] z-40 flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onZoomIn}
        disabled={scale >= 3.99}
        aria-label="Zoom in"
        className={btn}
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={scale <= 1.01}
        aria-label="Zoom out"
        className={btn}
      >
        −
      </button>
      {away && (
        <button
          type="button"
          onClick={onReset}
          aria-label="Back to the gate"
          className={`${btn} text-[10px] uppercase tracking-wide`}
        >
          1×
        </button>
      )}
    </div>
  );
}

/**
 * A little wooden signpost at the far right end of the bed — tapping it adds
 * another plot of land. Pointer taps come through the scene's pan-zoom tap
 * handler (`data-garden-expand`); `onClick` only answers the keyboard.
 */
function ExpandSign({ label, onExpand }: { label: string; onExpand: () => void }) {
  return (
    <button
      type="button"
      data-garden-expand
      onClick={(event) => {
        if (event.detail === 0) onExpand();
      }}
      aria-label={label}
      className="absolute right-1 top-[18%] z-30 flex flex-col items-center rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <svg width={74} height={70} viewBox="0 0 74 70" aria-hidden>
        <rect x={34} y={24} width={6} height={46} rx={2} fill="#8a6a45" />
        <path d="M6 8 H60 L70 20 L60 32 H6 Z" fill="#e8d5b0" stroke="#a88659" strokeWidth={2} />
        <path d="M22 20 H48 M35 13 V27" stroke="#6b8f4e" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={37} cy={68} rx={14} ry={3} fill="rgba(0,0,0,0.2)" />
      </svg>
      <span className="-mt-1 whitespace-nowrap rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        {label}
      </span>
    </button>
  );
}

/** Rounded shrub silhouettes sitting on the back edge of the bed. */
function Bushes({ light, dark }: { light: string; dark: string }) {
  const items = [
    { left: "7%", w: 132, h: 48 },
    { left: "35%", w: 92, h: 36 },
    { left: "63%", w: 156, h: 54 },
    { left: "88%", w: 112, h: 42 },
  ];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -translate-y-[38%]">
      {items.map((b, i) => (
        <svg
          key={i}
          width={b.w}
          height={b.h}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute bottom-0"
          style={{ left: b.left, transform: "translateX(-50%)" }}
          aria-hidden
        >
          <ellipse cx="28" cy="30" rx="26" ry="17" fill={dark} />
          <ellipse cx="55" cy="23" rx="30" ry="21" fill={dark} />
          <ellipse cx="76" cy="30" rx="22" ry="15" fill={light} opacity={0.85} />
          <ellipse cx="44" cy="27" rx="20" ry="14" fill={light} opacity={0.45} />
        </svg>
      ))}
    </div>
  );
}

/** A fringe of grass blades across the very front of the scene. */
function GrassFringe({
  light,
  dark,
  reduceMotion,
}: {
  light: string;
  dark: string;
  reduceMotion: boolean;
}) {
  const blades = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => {
        const x = (i / 129) * 400 + (((i * 37) % 9) - 4);
        const h = 20 + ((i * 53) % 34);
        const lean = (((i * 29) % 16) - 8) * 0.9;
        return { x, h, lean, dark: i % 3 === 0 };
      }),
    [],
  );

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-3 h-20"
      animate={reduceMotion ? undefined : { skewX: [-1.1, 1.1, -1.1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "bottom center" }}
    >
      <svg
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-full w-full"
      >
        {blades.map((b, i) => (
          <path
            key={i}
            d={`M${b.x},64 C ${b.x + b.lean},${64 - b.h * 0.55} ${b.x + b.lean * 1.6},${64 - b.h * 0.85} ${b.x + b.lean * 2},${64 - b.h}`}
            fill="none"
            stroke={b.dark ? dark : light}
            strokeWidth={b.dark ? 2.4 : 1.8}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </motion.div>
  );
}

/** A soft, three-lobe cloud. */
function Cloud({ size, fill }: { size: number; fill: string }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      aria-hidden
      style={{ filter: "blur(0.3px)" }}
    >
      <g fill={fill}>
        <ellipse cx="32" cy="38" rx="24" ry="18" />
        <ellipse cx="54" cy="30" rx="26" ry="22" />
        <ellipse cx="74" cy="40" rx="20" ry="16" />
        <rect x="20" y="40" width="62" height="16" rx="8" />
      </g>
    </svg>
  );
}
