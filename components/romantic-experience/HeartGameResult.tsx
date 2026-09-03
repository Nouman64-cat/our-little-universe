"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { GlowButton } from "./ui/GlowButton";
import { HeartIcon } from "./ui/HeartIcon";

interface HeartGameResultProps {
  score: number;
  /** The teasing line under the score (AI-varied per run). */
  reveal: string;
  onContinue: () => void;
  ctaLabel?: string;
  /** Longest unbroken catch streak this run — celebrated if it was a good one. */
  bestCombo?: number;
  /** Optional line under the button, e.g. lifetime stats in the hub. */
  footer?: ReactNode;
}

/**
 * The reveal after the mini-game. The score line lands first, then — after a
 * beat — the teasing line. Warm at any score, including zero. Shared by the
 * journey and the hub's Play tab.
 */
export function HeartGameResult({
  score,
  reveal,
  onContinue,
  ctaLabel = copy.result.cta,
  bestCombo = 0,
  footer,
}: HeartGameResultProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <motion.div
        className="mb-8 h-14 w-14 text-rose"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE_SOFT }}
        style={{ filter: "drop-shadow(0 0 20px rgba(255,158,196,0.6))" }}
      >
        <motion.div
          className="h-full w-full"
          animate={reduceMotion ? undefined : { scale: [1, 1.09, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.div>
      </motion.div>

      <motion.p
        className="font-display text-2xl font-medium text-ink"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.2 }}
      >
        {copy.result.score(score)}
      </motion.p>

      {bestCombo >= 4 && (
        <motion.p
          className="mt-2 text-xs uppercase tracking-[0.25em] text-honey"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.7 }}
        >
          {bestCombo} in a row ♡
        </motion.p>
      )}

      <motion.p
        suppressHydrationWarning
        className="mt-5 text-lg leading-relaxed text-rose-bright"
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE_SOFT, delay: 1.6 }}
      >
        {reveal}
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 2.6 }}
      >
        <GlowButton onClick={onContinue} ariaLabel={ctaLabel}>
          {ctaLabel}
        </GlowButton>
        {footer && <p className="text-xs text-ink-faint">{footer}</p>}
      </motion.div>
    </div>
  );
}
