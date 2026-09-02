"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { haptic } from "@/lib/utils";
import { CandyIcon } from "../ui/CandyIcon";
import { useKeepsakes } from "./keepsake-context";
import { NoteOverlay } from "./ui/NoteOverlay";
import { TabScreen } from "./ui/TabScreen";

type Tone = "pink" | "lilac" | "honey";

/** Fixed candy pile — hand-placed (percent of the inner jar) so it looks scattered. */
const CANDIES: { x: number; y: number; rot: number; tone: Tone }[] = [
  { x: 8, y: 70, rot: -18, tone: "pink" },
  { x: 40, y: 80, rot: 8, tone: "lilac" },
  { x: 66, y: 68, rot: 24, tone: "honey" },
  { x: 24, y: 54, rot: 14, tone: "honey" },
  { x: 52, y: 50, rot: -12, tone: "pink" },
  { x: 72, y: 40, rot: 26, tone: "lilac" },
  { x: 6, y: 42, rot: 20, tone: "lilac" },
  { x: 36, y: 30, rot: -8, tone: "pink" },
  { x: 62, y: 24, rot: 16, tone: "honey" },
  { x: 18, y: 20, rot: -22, tone: "honey" },
  { x: 46, y: 12, rot: 6, tone: "lilac" },
  { x: 70, y: 10, rot: -16, tone: "pink" },
];

interface OpenSweet {
  text: string;
  ofDay: boolean;
}

/** The sweet jar: one "sweet of the day", plus endless casual ones. */
export function SweetsTab() {
  const reduceMotion = useReducedMotion();
  const { sweetOfDay, sweetTaken, takeSweetOfDay, randomSweet } = useKeepsakes();
  const [open, setOpen] = useState<OpenSweet | null>(null);

  // The glowing candy is the sweet of the day.
  const dayCandyIndex = 4;

  const jarCandies = useMemo(() => CANDIES, []);

  const openDaySweet = () => {
    haptic(8);
    if (!sweetTaken) takeSweetOfDay();
    setOpen({ text: sweetOfDay, ofDay: true });
  };

  const openRandomSweet = () => {
    haptic(6);
    setOpen({ text: randomSweet(), ofDay: false });
  };

  return (
    <TabScreen title={copy.hub.sweets.title} subtitle={copy.hub.sweets.subtitle}>
      <p className="mb-4 text-sm text-ink-faint" suppressHydrationWarning>
        {sweetTaken ? copy.hub.sweets.taken : `${copy.hub.sweets.ofTheDay} is glowing`}
      </p>

      <div className="relative mx-auto aspect-[4/5] w-full max-w-[19rem]">
        {/* jar */}
        <div className="absolute inset-x-2 top-6 bottom-0 rounded-b-[2.5rem] rounded-t-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md" />
        <div className="absolute inset-x-8 top-1 h-6 rounded-full border border-white/15 bg-white/10" />
        <div className="absolute left-6 top-10 bottom-6 w-3 rounded-full bg-gradient-to-b from-white/25 to-transparent" />

        {/* candies */}
        <div className="absolute inset-x-5 bottom-5 top-12">
          {jarCandies.map((candy, index) => {
            const isDay = index === dayCandyIndex;
            return (
              <motion.button
                key={index}
                type="button"
                onClick={isDay ? openDaySweet : openRandomSweet}
                aria-label={isDay ? "Open today's sweet" : "Open a sweet"}
                className="absolute w-[22%] min-w-[44px] max-w-[60px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
                style={{
                  left: `${candy.x}%`,
                  top: `${candy.y}%`,
                  rotate: `${candy.rot}deg`,
                  filter: isDay
                    ? "drop-shadow(0 0 12px rgba(255,158,196,0.85))"
                    : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
                whileTap={reduceMotion ? undefined : { scale: 0.86 }}
                animate={
                  isDay && !reduceMotion && !sweetTaken
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={
                  isDay && !sweetTaken
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
              >
                <CandyIcon className="w-full" tone={candy.tone} />
              </motion.button>
            );
          })}
        </div>
      </div>

      <NoteOverlay
        open={open !== null}
        onClose={() => setOpen(null)}
        label="A sweet"
      >
        {open && (
          <div className="rounded-3xl border border-white/12 bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
            <motion.div
              className="mx-auto mb-5 w-20"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_SOFT }}
            >
              <CandyIcon className="w-full" tone={open.ofDay ? "pink" : "lilac"} />
            </motion.div>
            {open.ofDay && (
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-rose">
                {copy.hub.sweets.ofTheDay}
              </p>
            )}
            <p className="font-display text-lg leading-relaxed text-ink">{open.text}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={openRandomSweet}
                className="rounded-full border border-rose/40 bg-rose/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
              >
                {copy.hub.sweets.another}
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
              >
                {copy.hub.sweets.close}
              </button>
            </div>
          </div>
        )}
      </NoteOverlay>
    </TabScreen>
  );
}
