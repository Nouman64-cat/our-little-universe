"use client";

import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import type { HubTab } from "@/types/experience";
import { LilyBloom } from "../LilyBloom";
import { LilyIcon } from "../ui/LilyIcon";
import { useKeepsakes } from "./keepsake-context";
import { TabScreen } from "./ui/TabScreen";

interface HomeTabProps {
  onNavigate: (tab: HubTab) => void;
  onReplayJourney: () => void;
}

/** A small envelope glyph for the letter card. */
function Envelope() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-rose" aria-hidden>
      <rect x="3" y="6" width="18" height="12.5" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7.5 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The hub's home: not a dashboard — an arrival. A flower opens in greeting, the
 * message breathes, one letter waits, and the garden grows along the floor.
 */
export function HomeTab({ onNavigate, onReplayJourney }: HomeTabProps) {
  const reduceMotion = useReducedMotion();
  const {
    nickname,
    timeGreeting,
    greetingLine,
    daysKnown,
    blooms,
    streak,
    sweetTaken,
  } = useKeepsakes();

  const gardenLilies = blooms.slice(-7);

  const fade = (delay: number) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_SOFT, delay },
  });

  return (
    <TabScreen>
      <div className="flex flex-1 flex-col items-center">
        {/* ── greeting ── */}
        <div className="relative flex flex-1 flex-col items-center justify-center pb-6 text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose/15 blur-[70px]"
          />

          <motion.div
            className="relative mb-7 h-14 w-14"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_SOFT }}
            style={{ filter: "drop-shadow(0 0 20px rgba(255,158,196,0.5))" }}
          >
            <LilyBloom className="h-full w-full" />
          </motion.div>

          <motion.p
            {...fade(0.15)}
            className="relative text-[11px] uppercase tracking-[0.42em] text-ink-faint"
          >
            {copy.hub.home.day(daysKnown)}
          </motion.p>

          <motion.h1
            {...fade(0.26)}
            className="relative mt-3 font-display text-[2rem] font-medium leading-tight text-ink"
          >
            {timeGreeting},
            <br />
            <span
              className="text-rose-bright"
              style={{ filter: "drop-shadow(0 0 14px rgba(255,184,214,0.35))" }}
            >
              {nickname}.
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.42)}
            suppressHydrationWarning
            className="relative mt-4 max-w-[17rem] font-display text-base italic leading-relaxed text-ink-muted"
          >
            {greetingLine}
          </motion.p>
        </div>

        {/* ── the letter waiting ── */}
        <motion.button
          {...fade(0.56)}
          type="button"
          onClick={() => onNavigate("us")}
          className="group flex w-full max-w-[20rem] items-center gap-4 rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-5 py-4 text-left backdrop-blur-md transition-colors hover:from-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose/15">
            <Envelope />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] text-ink">
              {copy.hub.home.letterCard}
            </span>
            <span className="block text-xs italic text-ink-faint">
              {copy.hub.home.letterHint}
            </span>
          </span>
          <span className="text-ink-faint transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </motion.button>

        <motion.button
          {...fade(0.66)}
          type="button"
          onClick={() => onNavigate("sweets")}
          className="mt-3 text-[13px] text-ink-faint transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          suppressHydrationWarning
        >
          {copy.hub.home.sweetLink(sweetTaken)}
        </motion.button>

        {/* ── the garden, growing along the floor ── */}
        <motion.button
          {...fade(0.8)}
          type="button"
          onClick={() => onNavigate("garden")}
          aria-label="Visit the garden"
          className="mt-10 w-full max-w-[22rem] rounded-2xl px-2 pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          <div className="flex items-end justify-center gap-1">
            {gardenLilies.length > 0 ? (
              gardenLilies.map((bloom, index) => (
                <span
                  key={bloom.id}
                  className="block"
                  style={{
                    width: 26,
                    height: 26,
                    marginBottom: index % 2 === 0 ? 4 : 0,
                  }}
                >
                  <LilyIcon className="h-full w-full" />
                </span>
              ))
            ) : (
              <span className="block h-6 w-6 opacity-30">
                <LilyIcon className="h-full w-full" />
              </span>
            )}
          </div>
          <div
            className="mt-1 h-px w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-leaf), transparent)",
              boxShadow: "0 2px 12px -2px rgba(143,184,156,0.5)",
            }}
          />
          <p className="mt-2 text-center text-xs text-ink-faint" suppressHydrationWarning>
            {copy.hub.home.gardenCaption(streak, blooms.length)}
          </p>
        </motion.button>

        <motion.button
          {...fade(0.95)}
          type="button"
          onClick={onReplayJourney}
          className="mt-6 text-xs text-ink-faint/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          {copy.hub.home.replay}
        </motion.button>
      </div>
    </TabScreen>
  );
}
