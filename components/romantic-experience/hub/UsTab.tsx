"use client";

import { useEffect, useState } from "react";
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
  const {
    letters,
    letterOfDayIndex,
    readLetters,
    firstUnreadLetter,
    lettersReadCount,
    markLetterRead,
    moments,
    momentOfVisit,
  } = useKeepsakes();

  // Arrive on the earliest letter she hasn't opened; once she's read them all,
  // fall back to the day's pick so there's still a fresh one on top.
  const [letterIndex, setLetterIndex] = useState(
    firstUnreadLetter ?? letterOfDayIndex,
  );
  const [momentIndex, setMomentIndex] = useState<number | null>(
    moments.length > 0 ? momentOfVisit : null,
  );

  // Opening a letter (landing on it counts) marks it read for good.
  useEffect(() => {
    markLetterRead(letterIndex);
  }, [letterIndex, markLetterRead]);

  const letter = letters[letterIndex];
  const allRead = lettersReadCount >= letters.length;
  const stars = STAR_POSITIONS.slice(0, Math.max(moments.length, 2));
  const linePath = stars
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");

  const go = (index: number) => {
    haptic(4);
    setLetterIndex((index + letters.length) % letters.length);
  };

  return (
    <TabScreen title={copy.hub.us.title}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-faint">
          {copy.hub.us.letterLabel}
        </p>
        <p className="text-xs text-ink-faint" suppressHydrationWarning>
          {copy.hub.us.letterProgress(lettersReadCount, letters.length)}
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.article
            key={letterIndex}
            className="rounded-3xl border border-hairline bg-surface p-6 backdrop-blur-md"
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
          <>
            <div className="mt-4 flex items-center justify-center gap-4 text-ink-faint">
              <button
                type="button"
                onClick={() => go(letterIndex - 1)}
                aria-label="Previous letter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
              >
                ←
              </button>

              <div className="flex items-center gap-2">
                {letters.map((_, index) => {
                  const isCurrent = index === letterIndex;
                  const isRead = isCurrent || readLetters.includes(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => go(index)}
                      aria-label={`Letter ${index + 1}${isRead ? ", opened" : ", unopened"}`}
                      aria-current={isCurrent ? "true" : undefined}
                      className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
                    >
                      <motion.span
                        className="block rounded-full"
                        animate={{
                          width: isCurrent ? 9 : 7,
                          height: isCurrent ? 9 : 7,
                          backgroundColor: isRead
                            ? "var(--color-rose)"
                            : "color-mix(in srgb, var(--color-ink-faint) 40%, transparent)",
                          scale: isCurrent ? 1 : 0.9,
                        }}
                        transition={{ duration: 0.25, ease: EASE_SOFT }}
                        style={
                          isCurrent
                            ? { boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-rose) 25%, transparent)" }
                            : undefined
                        }
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => go(letterIndex + 1)}
                aria-label="Next letter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
              >
                →
              </button>
            </div>

            {allRead && (
              <p className="mt-3 text-center text-xs italic text-ink-faint">
                {copy.hub.us.allRead}
              </p>
            )}
          </>
        )}
      </div>

      <section className="mt-10">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg text-ink">{copy.hub.us.momentsTitle}</h2>
          <span className="text-xs text-ink-faint">{copy.hub.us.momentsHint}</span>
        </div>

        <div className="rounded-3xl border border-hairline bg-surface p-4">
          <svg viewBox="0 0 300 170" className="w-full">
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--color-ink-faint)"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="2 4"
              initial={reduceMotion ? undefined : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE_SOFT }}
            />
            {stars.map(([x, y], index) => {
              const selected = index === momentIndex;
              const isMoment = index < moments.length;
              return (
                <g key={index}>
                  {selected && (
                    <circle cx={x} cy={y} r={9} fill="rgba(255,158,196,0.25)" />
                  )}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={selected ? 4.5 : 3}
                    fill={
                      isMoment
                        ? "var(--color-rose-bright)"
                        : "color-mix(in srgb, var(--color-ink-faint) 45%, transparent)"
                    }
                    style={{
                      filter: selected
                        ? "drop-shadow(0 0 6px rgba(255,158,196,0.9))"
                        : undefined,
                      cursor: isMoment ? "pointer" : "default",
                    }}
                    animate={
                      reduceMotion || !isMoment || selected
                        ? undefined
                        : { opacity: [0.55, 1, 0.55] }
                    }
                    transition={{
                      duration: 3.2,
                      delay: index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    onClick={() =>
                      isMoment && setMomentIndex(selected ? null : index)
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
