"use client";

import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { GlowButton } from "./ui/GlowButton";
import { HeartIcon } from "./ui/HeartIcon";
import { useWhispers } from "./whisper-context";

interface LandingProps {
  onStart: () => void;
}

/** Opening screen: sets the tone and hands off into the first mini-game. */
export function Landing({ onStart }: LandingProps) {
  const reduceMotion = useReducedMotion();
  const { intro } = useWhispers();

  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <motion.div
        className="mb-10 h-16 w-16 text-rose"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE_SOFT, delay: 0.1 }}
        style={{ filter: "drop-shadow(0 0 24px rgba(255,158,196,0.55))" }}
      >
        <motion.div
          className="h-full w-full"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.div>
      </motion.div>

      <motion.p
        className="mb-3 text-xs uppercase tracking-[0.35em] text-ink-faint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.25 }}
      >
        {copy.landing.kicker}
      </motion.p>

      <motion.h1
        className="font-display text-4xl font-medium leading-tight text-ink"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.35 }}
      >
        {copy.landing.title}
      </motion.h1>

      <motion.p
        // The intro line is picked randomly per visit; server and client may
        // differ, so let React keep the client's choice without warning.
        suppressHydrationWarning
        className="mt-4 text-base leading-relaxed text-ink-muted"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.5 }}
      >
        {intro}
      </motion.p>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.7 }}
      >
        <GlowButton onClick={onStart} ariaLabel="Start the experience">
          {copy.landing.cta}
        </GlowButton>
      </motion.div>
    </div>
  );
}
