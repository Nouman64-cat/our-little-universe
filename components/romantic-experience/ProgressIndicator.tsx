"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Chapter } from "@/types/experience";
import { HeartIcon } from "./ui/HeartIcon";

interface ProgressIndicatorProps {
  /** The chapter currently in progress (0–2). */
  chapter: Chapter;
  /** True on the final screen — every heart reads as complete. */
  allComplete?: boolean;
}

const HEARTS = [0, 1, 2] as const;

/**
 * Three hearts joined by threads — ♡ ━ ♡ ━ ♡ — marking the journey without a
 * "step N of 3" label. Past chapters glow solid, the current one pulses, and
 * upcoming ones stay as faint outlines.
 */
export function ProgressIndicator({ chapter, allComplete = false }: ProgressIndicatorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center pt-[calc(env(safe-area-inset-top)+1.1rem)]"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={allComplete ? 3 : chapter + 1}
      aria-label="Journey progress"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
        {HEARTS.map((index) => {
          const done = allComplete || index < chapter;
          const active = !allComplete && index === chapter;

          return (
            <div key={index} className="flex items-center gap-2.5">
              {index > 0 && (
                <span
                  className={[
                    "h-px w-6 rounded-full transition-colors duration-700",
                    done || active ? "bg-rose/60" : "bg-white/15",
                  ].join(" ")}
                />
              )}
              <motion.span
                className={[
                  "block h-3.5 w-3.5",
                  done ? "text-rose" : "text-ink-faint",
                ].join(" ")}
                animate={
                  active && !reduceMotion
                    ? { scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] }
                    : { scale: 1, opacity: done ? 1 : 0.55 }
                }
                transition={
                  active && !reduceMotion
                    ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.4 }
                }
                style={
                  done
                    ? { filter: "drop-shadow(0 0 6px rgba(255,158,196,0.7))" }
                    : undefined
                }
              >
                <HeartIcon
                  className="h-full w-full"
                  outline={!done}
                />
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
