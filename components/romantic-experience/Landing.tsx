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
    <motion.div
      className="flex w-full max-w-sm flex-col items-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heart resting in a soft glass halo */}
      <motion.div
        className="relative mb-9 flex h-24 w-24 items-center justify-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE_SOFT, delay: 0.1 }}
      >
        <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md" />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full bg-rose/20 blur-xl"
        />
        <motion.span
          className="relative h-11 w-11 text-rose"
          animate={reduceMotion ? undefined : { scale: [1, 1.09, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 16px rgba(255,158,196,0.6))" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
      </motion.div>

      {/* Letter-style address */}
      <motion.p
        className="font-display text-2xl italic text-rose-bright/90"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.28 }}
      >
        {copy.landing.address}
      </motion.p>

      <motion.span
        aria-hidden
        className="my-4 block h-px w-12 bg-gradient-to-r from-transparent via-rose/60 to-transparent"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.42 }}
      />

      <motion.h1
        className="font-display text-[2rem] font-medium leading-tight text-ink"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.5 }}
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
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.64 }}
      >
        {intro}
      </motion.p>

      <motion.div
        className="mt-11"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.82 }}
      >
        <GlowButton onClick={onStart} ariaLabel="Start the experience">
          {copy.landing.cta}
        </GlowButton>
      </motion.div>
    </motion.div>
  );
}
