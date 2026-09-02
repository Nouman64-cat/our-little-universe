"use client";

import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT, lineVariants } from "@/lib/motion";
import { GlowButton } from "./ui/GlowButton";
import { HeartIcon } from "./ui/HeartIcon";

interface FinalMessageProps {
  onRestart: () => void;
}

/**
 * The closing screen. The two lines arrive one at a time and are given room to
 * breathe; the "start again" button only fades in well afterwards.
 */
export function FinalMessage({ onRestart }: FinalMessageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <motion.div
        className="mb-12 h-12 w-12 text-rose"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE_SOFT }}
        style={{ filter: "drop-shadow(0 0 26px rgba(255,158,196,0.6))" }}
      >
        <motion.div
          className="h-full w-full"
          animate={reduceMotion ? undefined : { scale: [1, 1.07, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.div>
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
