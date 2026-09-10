"use client";

import { useMemo, type MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";
import { hashString, skyPhase, sunProgress, type SkyPhase } from "@/lib/daily";
import { FlowerArt } from "../flowers";
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
      onClick={onOpen}
      aria-label={`Lily from ${bloom.label}`}
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
  onOpen: (bloom: GardenLily) => void;
  /** She tapped an empty spot in the bed — grow a flower there (each 0–1). */
  onPlant: (x: number, y: number) => void;
}

/**
 * The garden itself: a sky that shifts with the actual time of day, a drifting
 * sun or moon, slow clouds, background shrubs, a grassy bank the flowers grow
 * out of, and a fringe of grass blades across the foreground. The flowers are
 * scattered naturally across the bed rather than lined up; tapping an empty
 * patch of grass plants a new one right there. Every animation drops to a
 * still frame when motion is reduced.
 */
export function GardenScene({
  blooms,
  freshId,
  emptyLine,
  plantLabel,
  onOpen,
  onPlant,
}: GardenSceneProps) {
  const reduceMotion = useReducedMotion();

  const handleBedClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));
    const x = clamp((event.clientX - rect.left) / rect.width, 0.05, 0.95);
    // top of the bed reads as the back of the border, bottom as the front
    const y = clamp((event.clientY - rect.top) / rect.height, 0.06, 0.96);
    onPlant(x, y);
  };

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
    <div className="absolute inset-0 overflow-hidden">
      {/* sky */}
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
        <div className="relative mx-auto h-[clamp(11rem,30vh,16rem)] w-full max-w-md">
          {/* shrubs along the back of the bed */}
          <Bushes light={scene.bladeLight} dark={scene.bush} />

          {/* tap an empty patch of grass to plant a flower right there */}
          <button
            type="button"
            aria-label={plantLabel}
            onClick={handleBedClick}
            className="absolute inset-0 z-0 rounded-[45%/22%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/50"
          />

          {blooms.map((bloom) => {
            // nearer the front → a touch bigger and layered over the ones behind
            const depth = 0.76 + bloom.y * 0.36;
            return (
              <div
                key={bloom.id}
                className="absolute"
                style={{
                  left: `${6 + bloom.x * 88}%`,
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

          {/* grass tufting up around the stems */}
          <GrassFringe
            light={scene.bladeLight}
            dark={scene.bladeDark}
            reduceMotion={!!reduceMotion}
          />

          {blooms.length === 0 && (
            <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
              {emptyLine}
            </p>
          )}
        </div>
      </div>
    </div>
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
