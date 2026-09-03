"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { GAME_MAX_MISSES } from "@/lib/config";
import { HeartIcon } from "../ui/HeartIcon";

interface GameHudProps {
  /** Hearts missed so far (0 – GAME_MAX_MISSES). */
  misses: number;
  score: number;
  /** Sit near the top edge (hub) instead of below the journey progress bar. */
  embedded?: boolean;
}

/**
 * Lives + hearts collected. Five pips on the left: a live one is a bright,
 * glowing rose heart; the instant a heart slips past, the next pip flips to a
 * flat grey — so the colour itself tells you how many are left. The pill jolts
 * and the trailing number ticks down on each miss; the game ends at zero.
 */
function Lives({ misses }: { misses: number }) {
  const left = Math.max(0, GAME_MAX_MISSES - misses);

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface py-1.5 pl-3 pr-2.5 backdrop-blur-md"
      aria-label={`${left} of ${GAME_MAX_MISSES} hearts left`}
      animate={misses > 0 ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
    >
      {Array.from({ length: GAME_MAX_MISSES }, (_, i) => {
        const spent = i >= left;
        const justSpent = misses > 0 && i === left;
        return (
          <motion.span
            key={i}
            className="block h-3 w-3"
            style={{
              // Alive: bright rose with a glow. Missed: a plain neutral grey,
              // no pink left in it, so the count reads at a glance.
              color: spent ? "rgba(190,190,200,0.55)" : "var(--color-rose)",
              filter: spent ? "none" : "drop-shadow(0 0 4px rgba(255,158,196,0.85))",
            }}
            animate={
              justSpent
                ? { scale: [1, 1.5, 0.85, 1.1, 1], rotate: [0, -12, 10, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <HeartIcon className="h-full w-full" />
          </motion.span>
        );
      })}
      <motion.span
        key={left}
        className="ml-1 min-w-[1.25ch] text-xs tabular-nums text-ink-muted"
        initial={{ scale: 0.7, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {left}
      </motion.span>
    </motion.div>
  );
}

function GameHudComponent({ misses, score, embedded = false }: GameHudProps) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-x-0 z-20 flex items-center justify-between px-5",
        embedded ? "top-2" : "top-[calc(env(safe-area-inset-top)+4.25rem)]",
      ].join(" ")}
      aria-live="polite"
    >
      <Lives misses={misses} />
      <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 backdrop-blur-md">
        <motion.span
          key={score}
          className="block h-4 w-4 text-rose"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,158,196,0.7))" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
        <span className="min-w-[1.5ch] text-sm tabular-nums text-ink-muted">{score}</span>
      </div>
    </div>
  );
}

export const GameHud = memo(GameHudComponent);
