"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { haptic } from "@/lib/utils";
import { HeartIcon } from "../ui/HeartIcon";
import { useKeepsakes } from "./keepsake-context";
import { TabScreen } from "./ui/TabScreen";

/** Star coordinates for the constellation (viewBox 0 0 300 170). */
const STAR_POSITIONS: [number, number][] = [
  [34, 128],
  [92, 60],
  [150, 116],
  [212, 48],
  [268, 118],
  [244, 150],
];

export function UsTab() {
  const reduceMotion = useReducedMotion();
  const { letters, letterOfDayIndex, moments } = useKeepsakes();

  const [letterIndex, setLetterIndex] = useState(letterOfDayIndex);
  const [momentIndex, setMomentIndex] = useState<number | null>(null);

  const letter = letters[letterIndex];
  const stars = STAR_POSITIONS.slice(0, Math.max(moments.length, 2));
  const linePath = stars
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");

  const step = (delta: number) => {
    haptic(4);
    setLetterIndex((current) => (current + delta + letters.length) % letters.length);
  };

  return (
    <TabScreen title={copy.hub.us.title}>
      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-ink-faint">
        {copy.hub.us.letterLabel}
      </p>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.article
            key={letterIndex}
            className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-6 backdrop-blur-md"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE_SOFT }}
          >
            <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-rose/20">
              <HeartIcon className="h-4 w-4 text-rose" />
            </span>
            <p className="whitespace-pre-line font-display text-base leading-relaxed text-ink">
              {letter.body}
            </p>
            {letter.sign && (
              <p className="mt-4 text-right text-sm text-ink-muted">{letter.sign}</p>
            )}
          </motion.article>
        </AnimatePresence>

        {letters.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-4 text-ink-faint">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous letter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
            >
              ←
            </button>
            <span className="text-xs tabular-nums">
              {letterIndex + 1} / {letters.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next letter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
            >
              →
            </button>
          </div>
        )}
      </div>

      <section className="mt-10">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg text-ink">{copy.hub.us.momentsTitle}</h2>
          <span className="text-xs text-ink-faint">{copy.hub.us.momentsHint}</span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <svg viewBox="0 0 300 170" className="w-full">
            <path
              d={linePath}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {stars.map(([x, y], index) => {
              const selected = index === momentIndex;
              return (
                <g key={index}>
                  {selected && (
                    <circle cx={x} cy={y} r={9} fill="rgba(255,158,196,0.25)" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={selected ? 4.5 : 3}
                    fill={index < moments.length ? "#ffb8d6" : "rgba(255,255,255,0.3)"}
                    style={{
                      filter: selected
                        ? "drop-shadow(0 0 6px rgba(255,158,196,0.9))"
                        : undefined,
                      cursor: index < moments.length ? "pointer" : "default",
                    }}
                    onClick={() =>
                      index < moments.length &&
                      setMomentIndex(selected ? null : index)
                    }
                  />
                </g>
              );
            })}
          </svg>

          <AnimatePresence mode="wait">
            {momentIndex !== null && moments[momentIndex] && (
              <motion.div
                key={momentIndex}
                className="mt-2 text-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-ink-faint">
                  {moments[momentIndex].when}
                </p>
                <p className="mt-1 font-display text-base italic leading-relaxed text-ink">
                  {moments[momentIndex].line}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </TabScreen>
  );
}
