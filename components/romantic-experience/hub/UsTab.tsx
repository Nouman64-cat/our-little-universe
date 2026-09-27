"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import type { Letter } from "@/lib/keepsakes";
import { EASE_SOFT } from "@/lib/motion";
import { haptic } from "@/lib/utils";
import { useKeepsakes } from "./keepsake-context";
import { LetterBox } from "./LetterBox";
import { LetterReveal } from "./LetterReveal";
import { TabScreen } from "./ui/TabScreen";

const c = copy.hub.us;

/** The box always looks full — there's always another letter coming. */
const SEALED_IN_BOX = 6;

export function UsTab() {
  const reduceMotion = useReducedMotion();
  const {
    nextLetter,
    letterWaiting,
    lettersReadCount,
    openTodaysLetter,
  } = useKeepsakes();

  // A snapshot of the opened letter — the context moves on to tomorrow's.
  const [reading, setReading] = useState<Letter | null>(null);
  const [revealKey, setRevealKey] = useState(0);

  const ready = letterWaiting && nextLetter !== null;

  const handleOpen = () => {
    if (!ready) return;
    haptic([6, 22, 8]);
    setReading(nextLetter);
    setRevealKey((k) => k + 1);
    openTodaysLetter();
  };

  const caption = ready ? c.waiting : letterWaiting ? c.sealing : c.comeBack;

  return (
    <TabScreen title={c.title} subtitle={c.since}>
      <div className="my-auto flex flex-col items-center">
        <button
          type="button"
          onClick={handleOpen}
          disabled={!ready}
          aria-label={c.title}
          className="w-full max-w-[22rem] rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/50 disabled:cursor-default"
        >
          <LetterBox
            sealed={SEALED_IN_BOX}
            waiting={ready}
            reduceMotion={!!reduceMotion}
            onOpen={handleOpen}
          />
        </button>

        <motion.p
          key={caption}
          className="mt-2 text-center font-display text-base text-ink"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_SOFT }}
        >
          {caption}
        </motion.p>

        <p className="mt-1 text-xs text-ink-faint" suppressHydrationWarning>
          {c.progress(lettersReadCount)}
        </p>

        {ready && (
          <motion.button
            type="button"
            onClick={handleOpen}
            className="mt-6 rounded-full border border-rose/40 bg-rose/15 px-7 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: EASE_SOFT }}
          >
            {c.open}
          </motion.button>
        )}
      </div>

      <LetterReveal
        open={reading !== null}
        revealKey={revealKey}
        letter={reading}
        onClose={() => setReading(null)}
      />
    </TabScreen>
  );
}
