"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HOLD_DURATION_MS, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { LilyBloom } from "./LilyBloom";
import { HeartIcon } from "./ui/HeartIcon";

interface HoldToUnlockProps {
  onComplete: () => void;
}

const RING_RADIUS = 92;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * The final interaction: press and hold the heart for 3 continuous seconds.
 * The heartbeat quickens and the glow swells with progress; releasing early
 * eases everything gently back. On completion it blooms, then hands off.
 */
export function HoldToUnlock({ onComplete }: HoldToUnlockProps) {
  const reduceMotion = useReducedMotion();
  const [bloomed, setBloomed] = useState(false);

  const { progress, isHolding, isComplete, handlers } = useHoldProgress({
    durationMs: HOLD_DURATION_MS,
    onComplete: () => {
      setBloomed(true);
      // Let the bloom play before the screen settles into the final message.
      window.setTimeout(onComplete, 1100);
    },
  });

  // Heartbeat gets faster as the hold progresses.
  const beatDuration = reduceMotion ? 0 : 1.15 - progress * 0.72;
  const heartScale = 1 + progress * 0.14;

  return (
    <div className="flex flex-col items-center text-center">
      <motion.h2
        className="mb-14 font-display text-2xl font-medium text-ink"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_SOFT }}
      >
        {copy.hold.title}
      </motion.h2>

      <motion.div
        className="relative flex h-64 w-64 items-center justify-center"
        animate={
          bloomed && !reduceMotion
            ? { scale: [1, 1.14, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1, ease: EASE_SOFT }}
      >
        {/* Soft aura that pulses with the heartbeat. */}
        <motion.div
          className="absolute h-44 w-44 rounded-full bg-rose/25 blur-2xl"
          animate={
            reduceMotion
              ? { opacity: 0.3 + progress * 0.4 }
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.25 + progress * 0.4, 0.45 + progress * 0.4, 0.25 + progress * 0.4],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : { duration: Math.max(beatDuration, 0.4), repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* Expanding ring that tracks progress. */}
        <motion.div
          className="absolute rounded-full border border-rose/40"
          style={{ height: 176, width: 176 }}
          animate={{
            scale: 1 + progress * 0.35,
            opacity: 0.2 + progress * 0.5,
          }}
          transition={{ duration: 0.2, ease: "linear" }}
        />

        {/* Progress ring. */}
        <svg
          className="absolute -rotate-90"
          width={RING_RADIUS * 2 + 16}
          height={RING_RADIUS * 2 + 16}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Hold progress"
        >
          <circle
            cx="50%"
            cy="50%"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="50%"
            cy="50%"
            r={RING_RADIUS}
            fill="none"
            stroke="#ff9ec4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.12s linear" }}
          />
        </svg>

        {/* The heart itself — the press target. */}
        <motion.button
          type="button"
          {...handlers}
          aria-label="Press and hold the heart for three seconds"
          className="relative h-32 w-32 touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/70 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
          style={{
            filter: `drop-shadow(0 0 ${16 + progress * 40}px rgba(255,158,196,${0.5 + progress * 0.4}))`,
          }}
          animate={{ scale: bloomed ? 1.1 : heartScale }}
          transition={{ duration: 0.25, ease: EASE_SOFT }}
        >
          <motion.span
            className="block h-full w-full text-rose"
            animate={{
              opacity: bloomed ? 0.2 : 1,
              scale:
                beatDuration > 0 && (isHolding || progress > 0) && !bloomed
                  ? [1, 1.08, 1]
                  : 1,
            }}
            transition={
              beatDuration > 0 && !bloomed
                ? { duration: Math.max(beatDuration, 0.28), repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.4 }
            }
          >
            <HeartIcon className="h-full w-full" />
          </motion.span>
        </motion.button>

        {/* The lily opens over the heart once the hold completes. */}
        {bloomed && (
          <motion.div
            className="pointer-events-none absolute flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_SOFT }}
          >
            <div className="absolute h-40 w-40 rounded-full bg-rose/30 blur-2xl" />
            <LilyBloom className="relative h-52 w-52" />
          </motion.div>
        )}
      </motion.div>

      <motion.p
        className="mt-14 h-5 text-sm uppercase tracking-[0.3em] text-ink-faint"
        animate={{ opacity: isComplete ? 0 : 1 }}
      >
        {isHolding ? copy.hold.holding : copy.hold.released}
      </motion.p>
    </div>
  );
}
