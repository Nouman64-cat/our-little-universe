"use client";

import { motion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT, lineVariants } from "@/lib/motion";
import { LilyBloom } from "./LilyBloom";
import { GlowButton } from "./ui/GlowButton";

interface FinalMessageProps {
  onRestart: () => void;
}

/**
 * The closing screen. A lily opens above the message — the flower she loves —
 * then the two lines arrive one at a time with room to breathe; the "start
 * again" button only fades in well afterwards.
 */
export function FinalMessage({ onRestart }: FinalMessageProps) {
  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <motion.div
        className="relative mb-12 flex h-24 w-24 items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: EASE_SOFT }}
        style={{ filter: "drop-shadow(0 0 26px rgba(255,158,196,0.45))" }}
      >
        <div className="absolute h-20 w-20 rounded-full bg-rose/25 blur-2xl" />
        <LilyBloom className="relative h-24 w-24" />
      </motion.div>

      <motion.p
        className="font-display text-3xl font-medium leading-snug text-ink"
        variants={lineVariants}
        initial="initial"
        animate="animate"
        custom={0}
      >
        {copy.final.line1}
      </motion.p>

      <motion.p
        className="mt-5 text-lg leading-relaxed text-ink-muted"
        variants={lineVariants}
        initial="initial"
        animate="animate"
        custom={1}
      >
        {copy.final.line2}
      </motion.p>

      <motion.div
        className="mt-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE_SOFT, delay: 3.4 }}
      >
        <GlowButton onClick={onRestart} variant="ghost" ariaLabel="Start the experience again">
          {copy.final.cta}
        </GlowButton>
      </motion.div>
    </div>
  );
}
