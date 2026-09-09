"use client";

import { motion, useReducedMotion } from "motion/react";
import { hashString } from "@/lib/daily";
import { clamp } from "@/lib/utils";
import type { Star } from "@/lib/stars";
import { StarShape } from "../ui/StarShape";

interface StarJarProps {
  stars: Star[];
  /** The star that just landed — it settles in with a soft glow. */
  freshId: string | null;
  onSelect: (star: Star) => void;
}

const SHADOW = "drop-shadow(0 3px 6px rgba(0,0,0,0.28))";
const GLOW = "drop-shadow(0 0 14px rgba(255,158,196,0.9))";

const PER_ROW = 5;

interface Placed {
  star: Star;
  /** Percentages of the jar interior. `y` is measured from the bottom. */
  x: number;
  y: number;
  w: number;
  rot: number;
}

/** Pile the stars up from the bottom of the jar, tighter as more collect. */
function pileUp(stars: Star[]): { placed: Placed[]; w: number } {
  const rows = Math.max(1, Math.ceil(stars.length / PER_ROW));
  const rowGap = Math.min(15, 76 / rows);
  const w = clamp(rowGap * 0.95, 8, 13);

  const placed = stars.map((star, i) => {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const brick = row % 2 === 0 ? 0 : 9;
    const h = hashString(star.id);
    const jitterX = (h % 7) - 3;
    const jitterY = ((h >> 4) % 7) - 3;
    return {
      star,
      x: clamp(9 + col * 18 + brick + jitterX, 5, 92),
      y: 4 + row * rowGap + jitterY,
      w,
      rot: ((h >> 8) % 42) - 21,
    };
  });

  return { placed, w };
}

/** The glass jar and everything folded into it so far. */
export function StarJar({ stars, freshId, onSelect }: StarJarProps) {
  const reduceMotion = useReducedMotion();
  const { placed } = pileUp(stars);
  const lastIndex = stars.length - 1;

  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-[22rem]">
      {/* jar body + glass shine */}
      <div className="absolute inset-x-2 top-6 bottom-0 overflow-hidden rounded-b-[2.5rem] rounded-t-2xl border border-hairline-strong bg-surface backdrop-blur-md">
        <div className="absolute left-5 top-8 bottom-8 w-3 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
        <div className="absolute right-6 top-6 h-16 w-1.5 rounded-full bg-white/15" />
      </div>

      {/* wooden lid */}
      <div className="absolute inset-x-6 top-0 z-20">
        <div
          className="relative h-7 overflow-hidden rounded-full border border-[#5e3f26] shadow-[0_3px_8px_-2px_rgba(0,0,0,0.45)]"
          style={{
            background:
              "linear-gradient(180deg, #b07d47 0%, #935e31 45%, #74471f 100%)",
          }}
        >
          {/* grain */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 1px, transparent 1px 7px)",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5c3a1f]/70" />
        </div>
      </div>

      {/* the pile */}
      <div className="absolute inset-x-4 bottom-4 top-10">
        {placed.map(({ star, x, y, w, rot }, i) => {
          const isFresh = star.id === freshId && i === lastIndex;
          const stagger = i >= placed.length - 10;
          return (
            <motion.button
              key={star.id}
              type="button"
              onClick={() => onSelect(star)}
              aria-label={`Read the star from ${new Date(star.createdAt).toLocaleDateString()}`}
              className="absolute rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: `${w}%`,
              }}
              initial={
                reduceMotion
                  ? { opacity: 0, x: "-50%", rotate: rot, filter: SHADOW }
                  : isFresh
                    ? { opacity: 0, x: "-50%", y: -34, rotate: rot - 40, scale: 0.7, filter: GLOW }
                    : { opacity: 0, x: "-50%", rotate: rot, scale: 0.7, filter: SHADOW }
              }
              animate={{
                opacity: 1,
                x: "-50%",
                y: 0,
                rotate: rot,
                scale: 1,
                filter: isFresh && !reduceMotion ? [GLOW, GLOW, SHADOW] : SHADOW,
              }}
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : isFresh
                    ? {
                        default: { type: "spring", stiffness: 220, damping: 14 },
                        filter: { duration: 1.6, times: [0, 0.3, 1], ease: "easeOut" },
                      }
                    : {
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                        delay: stagger ? (i - (placed.length - 10)) * 0.04 : 0,
                      }
              }
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            >
              <StarShape className="w-full" color={star.color} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
