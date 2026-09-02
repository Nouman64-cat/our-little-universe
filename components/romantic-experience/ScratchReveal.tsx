"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SCRATCH_REVEAL_THRESHOLD, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { useScratchCanvas } from "@/hooks/useScratchCanvas";
import { GlowButton } from "./ui/GlowButton";
import { HeartIcon } from "./ui/HeartIcon";
import { useWhispers } from "./whisper-context";

interface ScratchRevealProps {
  onContinue: () => void;
}

/**
 * A card with a scratch-off foil over a romantic message. Once ~55% is cleared
 * the remaining foil fades on its own and the continue button appears. A
 * keyboard fallback ("Reveal it") clears it without dragging.
 */
export function ScratchReveal({ onContinue }: ScratchRevealProps) {
  const reduceMotion = useReducedMotion();
  const { scratchMessage } = useWhispers();
  const [revealed, setRevealed] = useState(false);

  const { canvasRef, progress, revealNow } = useScratchCanvas({
    threshold: SCRATCH_REVEAL_THRESHOLD,
    onReveal: () => setRevealed(true),
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center text-center">
      <motion.h2
        className="mb-8 font-display text-2xl font-medium text-ink"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_SOFT }}
      >
        {copy.scratch.title}
      </motion.h2>

      <motion.div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/12 bg-canvas-raised/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.15 }}
      >
        {/* Revealed content sits underneath the canvas. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <motion.div
            className="absolute h-28 w-28 text-rose blur-md"
            animate={
              reduceMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }
            }
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeartIcon className="h-full w-full" />
          </motion.div>
          <motion.p
            suppressHydrationWarning
            className="relative font-display text-xl font-medium leading-relaxed text-ink"
            animate={
              revealed
                ? { scale: reduceMotion ? 1 : [1, 1.04, 1], opacity: 1 }
                : { opacity: 1 }
            }
            transition={{ duration: 0.7, ease: EASE_SOFT }}
          >
            {scratchMessage}
          </motion.p>
        </div>

        <AnimatePresence>
          {!revealed && (
            <motion.canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full cursor-pointer touch-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              aria-label={`${copy.scratch.surface}. ${Math.round(progress * 100)}% revealed.`}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 h-[52px]">
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="continue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.4 }}
            >
              <GlowButton onClick={onContinue} ariaLabel="Continue to the last moment">
                {copy.scratch.cta}
              </GlowButton>
            </motion.div>
          ) : (
            <motion.button
              key="fallback"
              type="button"
              onClick={revealNow}
              className="text-sm text-ink-faint underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              {copy.scratch.fallback}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
