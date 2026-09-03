"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { CandyIcon, type CandyShape, type CandyTone } from "../ui/CandyIcon";
import { HeartIcon } from "../ui/HeartIcon";
import { CandySprinkles } from "./CandySprinkles";

interface CandyUnwrapProps {
  open: boolean;
  /** Bumped each time a new sweet is revealed, so the unwrap replays. */
  revealKey: number;
  text: string;
  ofDay: boolean;
  foil: boolean;
  tone: CandyTone;
  shape: CandyShape;
  canTakeMore: boolean;
  onAnother: () => void;
  onClose: () => void;
}

/**
 * The reveal: the candy tumbles in, pops open with a shower of sprinkles, and a
 * glowing heart is what was inside — then the sweet's words settle beneath it.
 */
export function CandyUnwrap({ open, revealKey, onClose, ...rest }: CandyUnwrapProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label="A sweet"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-md" />
          {/* keyed so each new sweet plays the unwrap from the start */}
          <UnwrapBody key={revealKey} onClose={onClose} {...rest} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type BodyProps = Omit<CandyUnwrapProps, "open" | "revealKey">;

function UnwrapBody({ text, ofDay, foil, tone, shape, canTakeMore, onAnother, onClose }: BodyProps) {
  const reduceMotion = useReducedMotion();
  const [timedOpen, setTimedOpen] = useState(false);
  const popped = timedOpen || !!reduceMotion;

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setTimedOpen(true), 620);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <div
      className="relative flex flex-col items-center"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="relative mb-6 h-28 w-28">
        <AnimatePresence>
          {!popped && (
            <motion.div
              key="candy"
              className="absolute inset-0"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -150 }}
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, rotate: [0, -9, 9, -4, 0] }
              }
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: 40 }}
              transition={{ duration: 0.5, ease: EASE_SOFT }}
            >
              <CandyIcon className="h-full w-full" tone={tone} shape={shape} foil={foil} />
            </motion.div>
          )}
        </AnimatePresence>

        {popped && (
          <>
            {!reduceMotion && <CandySprinkles count={foil ? 32 : 20} />}
            <motion.div
              key="heart"
              className="absolute inset-0 text-rose"
              style={{ filter: "drop-shadow(0 0 22px rgba(255,158,196,0.7))" }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: [1.4, 1] }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <HeartIcon className="h-full w-full" gold={foil} />
            </motion.div>
          </>
        )}
      </div>

      {(ofDay || foil) && (
        <motion.p
          className="mb-2 text-xs uppercase tracking-[0.28em]"
          style={{ color: foil ? "#e0ad3a" : "var(--color-rose)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: popped ? 1 : 0 }}
          transition={{ delay: 0.15 }}
        >
          {foil ? copy.hub.sweets.foil : copy.hub.sweets.ofTheDay}
        </motion.p>
      )}

      <motion.p
        className="max-w-xs font-display text-lg leading-relaxed text-ink"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: popped ? 1 : 0, y: popped ? 0 : 10 }}
        transition={{ duration: 0.5, ease: EASE_SOFT, delay: 0.1 }}
      >
        {text}
      </motion.p>

      <motion.div
        className="mt-7 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: popped ? 1 : 0 }}
        transition={{ delay: 0.35 }}
      >
        {canTakeMore && (
          <button
            type="button"
            onClick={onAnother}
            className="rounded-full border border-rose/40 bg-rose/15 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          >
            {copy.hub.sweets.another}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
        >
          {copy.hub.sweets.close}
        </button>
      </motion.div>
    </div>
  );
}
