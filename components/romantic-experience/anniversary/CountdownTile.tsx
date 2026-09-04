"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";

interface CountdownTileProps {
  value: number;
  label: string;
  reduceMotion?: boolean;
}

/** One flip-style digit tile. The value rolls in/out on `AnimatePresence` as it changes. */
export function CountdownTile({ value, label, reduceMotion }: CountdownTileProps) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-hairline-strong bg-surface-2 backdrop-blur-sm sm:h-[4.25rem] sm:w-[4.25rem]">
        <div className="absolute inset-0 bg-gradient-to-b from-rose/15 via-transparent to-lavender/15" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-hairline" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            className="absolute inset-0 flex items-center justify-center font-display text-2xl font-medium tabular-nums text-ink sm:text-3xl"
            initial={reduceMotion ? { opacity: 0 } : { y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: EASE_SOFT }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}
