"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNow } from "@/hooks/useNow";
import { NAMES } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { clamp } from "@/lib/utils";
import {
  ANNIVERSARY_START,
  anniversaryWindow,
  formatAnniversaryDate,
  getAnniversaryState,
  getPakistanNow,
  pakistanMidnightEpoch,
  splitDuration,
} from "@/lib/anniversary";
import { AmbientBackground } from "../AmbientBackground";
import { LilyBloom } from "../LilyBloom";
import { HeartIcon } from "../ui/HeartIcon";
import { CandySprinkles } from "../hub/CandySprinkles";
import { CountdownTile } from "./CountdownTile";

const START_EPOCH = pakistanMidnightEpoch(
  ANNIVERSARY_START.year,
  ANNIVERSARY_START.month,
  ANNIVERSARY_START.day,
);
const START_LABEL = `${formatAnniversaryDate(ANNIVERSARY_START.month, ANNIVERSARY_START.day)}, ${ANNIVERSARY_START.year}`;

/** A few hearts that float up slowly behind the card — the journey's motif, kept faint. */
const FLOATING_HEARTS = [
  { left: "10%", size: 22, delay: 0, duration: 13 },
  { left: "82%", size: 16, delay: 3.2, duration: 16 },
  { left: "24%", size: 14, delay: 6.5, duration: 14 },
  { left: "68%", size: 20, delay: 1.8, duration: 17 },
  { left: "48%", size: 12, delay: 8.4, duration: 12 },
] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/**
 * A standalone, shareable page: a live countdown to the next monthly
 * anniversary (the 5th of every month, since May 5), always computed against
 * Pakistan time regardless of the viewer's own clock. Bursts into a
 * celebration on the day itself.
 */
export function AnniversaryCountdown() {
  const reduceMotion = useReducedMotion();
  const now = useNow();
  const [burstKey, setBurstKey] = useState(0);

  const ready = now !== null;
  const pk = useMemo(() => getPakistanNow(new Date(now ?? START_EPOCH)), [now]);
  const state = useMemo(() => getAnniversaryState(pk), [pk]);

  const diff = state.targetEpoch - (now ?? state.targetEpoch);
  const parts = splitDuration(diff);
  const totalDays = ready ? Math.floor(((now as number) - START_EPOCH) / 86_400_000) : 0;

  const monthWindow = useMemo(() => anniversaryWindow(state), [state]);
  const progress = ready
    ? clamp(
        ((now as number) - monthWindow.startEpoch) /
          (monthWindow.endEpoch - monthWindow.startEpoch),
        0,
        1,
      )
    : 0;

  // Re-fire the confetti burst every few seconds on the anniversary day.
  useEffect(() => {
    if (!ready || !state.isAnniversaryToday || reduceMotion) return;
    const id = setInterval(() => setBurstKey((k) => k + 1), 4200);
    return () => clearInterval(id);
  }, [ready, state.isAnniversaryToday, reduceMotion]);

  const celebrating = ready && state.isAnniversaryToday;

  return (
    <div className="relative min-h-dvh w-full">
      <AmbientBackground />

      {!reduceMotion &&
        FLOATING_HEARTS.map((h, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none fixed bottom-[-10vh] -z-10 block text-rose/20"
            style={{ left: h.left, width: h.size, height: h.size }}
            animate={{ y: ["0vh", "-120vh"], opacity: [0, 0.8, 0] }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <HeartIcon className="h-full w-full" />
          </motion.span>
        ))}

      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]">
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            className="rounded-full px-2 py-1 text-sm text-ink-faint transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/50"
          >
            ‹ our little universe
          </Link>
        </div>

        <motion.p
          className="mt-8 font-display text-sm italic text-ink-muted"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SOFT }}
        >
          {NAMES.him} ♡ {NAMES.her}
        </motion.p>

        <div className="relative my-auto flex w-full flex-col items-center py-8">
          <AnimatePresence mode="wait">
            {celebrating ? (
              <motion.div
                key="celebrate"
                className="relative flex flex-col items-center text-center"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: EASE_SOFT }}
              >
                <div className="relative">
                  <LilyBloom className="h-28 w-28" play />
                  {!reduceMotion && (
                    <div className="absolute left-1/2 top-1/2">
                      <CandySprinkles key={burstKey} count={26} />
                    </div>
                  )}
                </div>
                <h1 className="mt-4 max-w-[18rem] text-balance font-display text-3xl font-medium text-ink sm:text-4xl">
                  {state.todayMonthCount} months, today ♡
                </h1>
                <p className="mt-3 max-w-xs text-balance text-ink-muted">
                  happy {ordinal(state.todayMonthCount)} monthiversary, {NAMES.her}.
                </p>
                <p className="mt-6 text-xs text-ink-faint">
                  next one — {formatAnniversaryDate(state.targetMonth)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="counting"
                className="flex w-full flex-col items-center"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: EASE_SOFT }}
              >
                <div className="relative">
                  <motion.span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-rose/25"
                    animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <HeartIcon className="h-24 w-24" />
                  </motion.span>
                  <p className="relative px-2 py-6 text-center text-xs uppercase tracking-[0.24em] text-ink-faint">
                    next monthiversary
                  </p>
                </div>

                <h1 className="text-balance text-center font-display text-2xl font-medium text-ink sm:text-3xl">
                  {formatAnniversaryDate(state.targetMonth)}
                  <span className="text-ink-muted"> · {state.monthCount} months</span>
                </h1>

                <div
                  className="mt-8 flex items-start gap-2.5 sm:gap-4"
                  role="timer"
                  aria-label={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds until ${formatAnniversaryDate(state.targetMonth)}`}
                  suppressHydrationWarning
                >
                  <CountdownTile value={parts.days} label="days" reduceMotion={!!reduceMotion} />
                  <span className="pt-3 font-display text-xl text-ink-faint sm:pt-4">:</span>
                  <CountdownTile value={parts.hours} label="hrs" reduceMotion={!!reduceMotion} />
                  <span className="pt-3 font-display text-xl text-ink-faint sm:pt-4">:</span>
                  <CountdownTile value={parts.minutes} label="min" reduceMotion={!!reduceMotion} />
                  <span className="pt-3 font-display text-xl text-ink-faint sm:pt-4">:</span>
                  <CountdownTile value={parts.seconds} label="sec" reduceMotion={!!reduceMotion} />
                </div>

                <div className="mt-8 h-1.5 w-full max-w-[19rem] overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose via-petal to-lavender"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.6, ease: EASE_SOFT }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-ink-faint">
            <span aria-hidden>🤍</span>
            <span suppressHydrationWarning>{totalDays.toLocaleString()} days together</span>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
              next monthiversary in
            </p>
            <p
              className="mt-1 font-display text-lg tabular-nums text-ink"
              suppressHydrationWarning
            >
              {ready
                ? `${pad(parts.days)}:${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
                : "--:--:--:--"}
            </p>
          </div>

          <p className="text-xs text-ink-faint">together since {START_LABEL}</p>
        </div>
      </div>
    </div>
  );
}
