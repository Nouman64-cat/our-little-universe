"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import type { Letter } from "@/lib/keepsakes";

interface LetterRevealProps {
  open: boolean;
  /** Bumped each time a letter is opened so the reveal replays. */
  revealKey: number;
  letter: Letter | null;
  onClose: () => void;
}

const PAPER = "#faf3e2";
const PAPER_EDGE = "#e7d7b2";
const INK = "#403528";
const INK_SOFT = "#7a6a52";
const SEAL = "#d8607f";

/**
 * Opening a letter: a sealed envelope tips in, the wax gives way, and the page
 * unfolds to fill the screen. It's read once — closing it puts it away for good.
 */
export function LetterReveal({ open, revealKey, letter, onClose }: LetterRevealProps) {
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
      {open && letter && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          role="dialog"
          aria-modal="true"
          aria-label="A letter"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-canvas/85 backdrop-blur-md" />
          <RevealBody key={revealKey} letter={letter} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RevealBody({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const [unfolded, setUnfolded] = useState(false);
  const open = unfolded || !!reduceMotion;

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setUnfolded(true), 680);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <div
      className="relative flex w-full max-w-sm flex-col items-center"
      onClick={(event) => event.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="envelope"
            className="w-56"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8, y: 24 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1, y: -12 }}
            transition={{ duration: 0.5, ease: EASE_SOFT }}
          >
            <svg viewBox="0 0 200 132" className="w-full" aria-hidden>
              <rect x={2} y={2} width={196} height={128} rx={7} fill={PAPER} stroke={PAPER_EDGE} strokeWidth={1.6} />
              <path d="M2 6 L100 74 L198 6" fill="none" stroke={PAPER_EDGE} strokeWidth={1.6} strokeLinejoin="round" />
              <motion.g
                initial={reduceMotion ? undefined : { scale: 1 }}
                animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "100px 64px" }}
              >
                <circle cx={100} cy={64} r={13} fill={SEAL} stroke="#b34c66" strokeWidth={1.4} />
                <path
                  d="M100 70 c -6 -6 -9 -8 -9 -12 a 4.4 4.4 0 0 1 9 -1.8 a 4.4 4.4 0 0 1 9 1.8 c 0 4 -3 6 -9 12 Z"
                  fill="#ffe0e9"
                />
              </motion.g>
            </svg>
          </motion.div>
        ) : (
          <motion.article
            key="page"
            className="max-h-[78vh] w-full overflow-y-auto rounded-[1.25rem] px-7 py-8 shadow-xl"
            style={{
              background: PAPER,
              border: `1px solid ${PAPER_EDGE}`,
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0 30px, rgba(120,100,60,0.06) 30px 31px)",
            }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ duration: 0.55, ease: EASE_SOFT }}
          >
            <span
              className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "rgba(216,96,127,0.14)" }}
            >
              <svg viewBox="0 0 24 22" className="h-4 w-4" aria-hidden>
                <path
                  d="M12 21 C 3 13 1 8 5.5 4 C 8.5 1.5 12 3.5 12 6 C 12 3.5 15.5 1.5 18.5 4 C 23 8 21 13 12 21 Z"
                  fill={SEAL}
                />
              </svg>
            </span>

            <p
              className="whitespace-pre-line font-display text-[1.03rem] leading-[1.75]"
              style={{ color: INK }}
            >
              {letter.body}
            </p>

            {letter.sign && (
              <p
                className="mt-6 text-right font-display text-sm italic"
                style={{ color: INK_SOFT }}
              >
                {letter.sign}
              </p>
            )}
          </motion.article>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClose}
        className="mt-7 rounded-full border border-rose/40 bg-rose/15 px-7 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        {copy.hub.us.close}
      </motion.button>
    </div>
  );
}
