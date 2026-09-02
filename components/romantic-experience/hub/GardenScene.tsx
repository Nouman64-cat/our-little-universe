"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";
import { hashString, skyPhase, sunProgress, type SkyPhase } from "@/lib/daily";
import { LilyBloom } from "../LilyBloom";
import { LilyIcon } from "../ui/LilyIcon";
import type { GardenLily } from "./keepsake-context";

/** Sky / ground palette per time of day. */
const SCENERY: Record<
  SkyPhase,
  { sky: string; grass: string; grassLip: string; orb: string; orbGlow: string; cloud: string }
> = {
  dawn: {
    sky: "linear-gradient(180deg, #f7cba8 0%, #edb9d0 44%, #c3d7ea 100%)",
    grass: "linear-gradient(180deg, #9ad39a 0%, #5faa68 100%)",
    grassLip: "#7cc47f",
    orb: "#fff1d6",
    orbGlow: "rgba(255, 214, 160, 0.75)",
    cloud: "rgba(255,255,255,0.82)",
  },
  day: {
    sky: "linear-gradient(180deg, #8ec7ea 0%, #bfe1f1 52%, #e9f5fb 100%)",
    grass: "linear-gradient(180deg, #93d18f 0%, #57a862 100%)",
    grassLip: "#74c079",
    orb: "#fff7e4",
    orbGlow: "rgba(255, 233, 178, 0.85)",
    cloud: "rgba(255,255,255,0.9)",
  },
  dusk: {
    sky: "linear-gradient(180deg, #f4a978 0%, #dd83a7 38%, #7f6aa8 74%, #4b4374 100%)",
    grass: "linear-gradient(180deg, #75a279 0%, #45704d 100%)",
    grassLip: "#5f9166",
    orb: "#ffe0b0",
    orbGlow: "rgba(255, 176, 120, 0.7)",
    cloud: "rgba(255,255,255,0.5)",
  },
  night: {
    sky: "linear-gradient(180deg, #131a3d 0%, #23224f 55%, #322f5e 100%)",
    grass: "linear-gradient(180deg, #33503f 0%, #1f3630 100%)",
    grassLip: "#3c5a48",
    orb: "#eef0ff",
    orbGlow: "rgba(200, 208, 255, 0.55)",
    cloud: "rgba(210,214,240,0.14)",
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

/** One lily on a stem, rooted in the grass. */
function Flower({
  bloom,
  fresh,
  reduceMotion,
  onOpen,
}: {
  bloom: GardenLily;
  fresh: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}) {
  const stemHeight = 30 + (hashString(bloom.id) % 30);
  const size = 40 + (hashString(`${bloom.id}s`) % 16);
  const lean = (hashString(`${bloom.id}l`) % 9) - 4;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Lily from ${bloom.label}`}
      className="group flex shrink-0 flex-col items-center rounded-xl px-0.5 pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
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
        className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
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
        {fresh ? (
          <LilyBloom className="h-full w-full" />
        ) : (
          <LilyIcon className="h-full w-full" />
        )}
      </motion.span>
      <motion.span
        className="w-[3px] rounded-full"
        style={{
          height: stemHeight,
          background: "linear-gradient(to top, #4d7d5f, var(--color-leaf))",
          transformOrigin: "bottom center",
        }}
        initial={reduceMotion || !fresh ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: EASE_SOFT }}
      />
    </motion.button>
  );
}

interface GardenSceneProps {
  blooms: GardenLily[];
  freshId: string | null;
  emptyLine: string;
  onOpen: (bloom: GardenLily) => void;
}

/**
 * The garden itself: a sky that shifts with the actual time of day, a drifting
 * sun or moon, slow clouds, and a grassy bank the lilies grow out of. Every
 * animation drops to a still frame when motion is reduced.
 */
export function GardenScene({ blooms, freshId, emptyLine, onOpen }: GardenSceneProps) {
  const reduceMotion = useReducedMotion();

  const { phase, scene, sun } = useMemo(() => {
    const now = new Date();
    const phase = skyPhase(now);
    const p = sunProgress(now);
    return {
      phase,
      scene: SCENERY[phase],
      sun: {
        left: `${8 + p * 82}%`,
        top: `${18 + (1 - Math.sin(p * Math.PI)) * 116}px`,
      },
    };
  }, []);

  const isNight = phase === "night";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-hairline shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)]">
      {/* sky */}
      <div className="absolute inset-0" style={{ background: scene.sky }} />

      {/* sky band — celestial elements live here so they stay put as the
          grass below grows with more lilies */}
      <div className="absolute inset-x-0 top-0 h-[240px] overflow-hidden">
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

      {/* air + ground (ground grows with the flowers; the sky sits behind it) */}
      <div className="relative">
        <div className="h-[190px]" />
        <div
          className="relative rounded-t-[50%/40px] px-4 pb-6 pt-9"
          style={{
            background: scene.grass,
            boxShadow: `inset 0 3px 0 ${scene.grassLip}, 0 -12px 30px -12px rgba(0,0,0,0.25)`,
          }}
        >
          {blooms.length > 0 ? (
            <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-3">
              {blooms.map((bloom) => (
                <Flower
                  key={bloom.id}
                  bloom={bloom}
                  fresh={bloom.id === freshId}
                  reduceMotion={!!reduceMotion}
                  onOpen={() => onOpen(bloom)}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
              {emptyLine}
            </p>
          )}
        </div>
      </div>
    </div>
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
