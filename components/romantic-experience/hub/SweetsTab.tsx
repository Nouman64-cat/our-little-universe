"use client";

import { useMemo, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { hashString } from "@/lib/daily";
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

/** The glowing candy is the sweet of the day. */
const DAY_CANDY_INDEX = 4;

interface OpenSweet {
  text: string;
  ofDay: boolean;
}

/** The sweet jar: one "sweet of the day", plus endless casual ones. */
export function SweetsTab() {
  const reduceMotion = useReducedMotion();
  const { sweetOfDay, sweetTaken, takeSweetOfDay, randomSweet } = useKeepsakes();
  const [open, setOpen] = useState<OpenSweet | null>(null);
  const [flyingIndex, setFlyingIndex] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);

  const jarControls = useAnimationControls();
  const jarCandies = useMemo(() => CANDIES, []);

  const revealSweet = (sweet: OpenSweet) => {
    if (reduceMotion) {
      setOpen(sweet);
      return;
    }
    window.setTimeout(() => setOpen(sweet), 440);
  };

  const takeCandy = (index: number) => {
    if (flyingIndex !== null || open) return;
    const isDay = index === DAY_CANDY_INDEX;
    haptic(isDay ? 8 : 6);
    setFlyingIndex(index);
    if (isDay && !sweetTaken) takeSweetOfDay();
    revealSweet({
      text: isDay ? sweetOfDay : randomSweet(),
      ofDay: isDay,
    });
  };

  const openAnother = () => {
    haptic(6);
    setOpen({ text: randomSweet(), ofDay: false });
  };

  const closeOverlay = () => {
    setOpen(null);
    setFlyingIndex(null);
  };

  const shakeJar = () => {
    if (flyingIndex !== null) return;
    haptic([6, 24]);
    if (!reduceMotion) {
      jarControls.start({
        rotate: [0, -3, 2.6, -2, 1.2, 0],
        x: [0, -4, 4, -3, 2, 0],
        transition: { duration: 0.55, ease: "easeInOut" },
      });
    }
    setShaking(true);
    window.setTimeout(() => setShaking(false), 560);
  };

  const lidTilt =
    open || shaking
      ? { rotate: -15, y: -16, x: 7 }
      : sweetTaken
        ? { rotate: -5, y: -3, x: 2 }
        : { rotate: 0, y: 0, x: 0 };

  return (
    <TabScreen title={copy.hub.sweets.title} subtitle={copy.hub.sweets.subtitle}>
      <p className="mb-4 text-sm text-ink-faint" suppressHydrationWarning>
        {sweetTaken ? copy.hub.sweets.taken : copy.hub.sweets.glowing}
      </p>

      <div className="relative mx-auto aspect-[4/5] w-full max-w-[19rem]">
        <motion.div className="absolute inset-0" animate={jarControls}>
          {/* jar body + glass shine */}
          <div className="absolute inset-x-2 top-6 bottom-0 overflow-hidden rounded-b-[2.5rem] rounded-t-2xl border border-hairline-strong bg-surface backdrop-blur-md">
            <div className="absolute left-5 top-8 bottom-8 w-3 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
            <div className="absolute right-6 top-6 h-16 w-1.5 rounded-full bg-white/15" />
          </div>

          {/* tap target for the shake — behind the candies */}
          <button
            type="button"
            onClick={shakeJar}
            aria-label="Shake the jar"
            className="absolute inset-x-2 top-6 bottom-0 z-0 rounded-b-[2.5rem] rounded-t-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/50"
          />

          {/* lid — also shakes the jar */}
          <motion.button
            type="button"
            onClick={shakeJar}
            aria-hidden
            tabIndex={-1}
            className="absolute inset-x-7 top-0 z-20 origin-bottom"
            animate={lidTilt}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <div className="relative h-7 rounded-full border border-hairline-strong bg-surface-2 backdrop-blur-md">
              <div className="absolute left-1/2 top-1/2 h-1.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-faint/40" />
            </div>
          </motion.button>

          {/* gift tag */}
          <div className="pointer-events-none absolute right-1 top-9 z-20 -rotate-6">
            <div className="rounded-md border border-hairline bg-canvas-raised/80 px-2 py-1 shadow-sm backdrop-blur-md">
              <span className="font-display text-[11px] italic text-ink-muted">
                {copy.hub.sweets.tag}
              </span>
            </div>
          </div>

          {/* candies (gaps fall through to the shake target behind) */}
          <div className="pointer-events-none absolute inset-x-5 bottom-5 top-12 z-10">
            {jarCandies.map((candy, index) => {
              const isDay = index === DAY_CANDY_INDEX;
              const isFlying = index === flyingIndex;
              const wobble = (hashString(`c${index}`) % 7) - 3;

              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => takeCandy(index)}
                  aria-label={isDay ? "Take today's sweet" : "Take a sweet"}
                  className="pointer-events-auto absolute w-[22%] min-w-[44px] max-w-[60px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
                  style={{
                    left: `${candy.x}%`,
                    top: `${candy.y}%`,
                    filter: isDay
                      ? "drop-shadow(0 0 12px rgba(255,158,196,0.85))"
                      : "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
                  }}
                  initial={
                    reduceMotion
                      ? { opacity: 0, rotate: candy.rot }
                      : { opacity: 0, y: -170 - index * 8, rotate: candy.rot - 40 }
                  }
                  animate={
                    isFlying
                      ? reduceMotion
                        ? { opacity: 0 }
                        : {
                            opacity: [1, 1, 1, 0],
                            y: -250,
                            x: wobble * 4,
                            scale: 1.4,
                            rotate: candy.rot + 420,
                          }
                      : shaking && !reduceMotion
                        ? {
                            opacity: 1,
                            y: [0, wobble * 2.2, 0],
                            rotate: [candy.rot, candy.rot + wobble * 3, candy.rot],
                            scale: 1,
                          }
                        : {
                            opacity: 1,
                            y: 0,
                            x: 0,
                            rotate: candy.rot,
                            scale:
                              flyingIndex !== null
                                ? 0.94
                                : isDay && !reduceMotion && !sweetTaken
                                  ? [1, 1.08, 1]
                                  : 1,
                          }
                  }
                  transition={
                    isFlying
                      ? { duration: 0.5, ease: "easeOut" }
                      : shaking
                        ? { duration: 0.5, ease: "easeInOut" }
                        : isDay && !sweetTaken && flyingIndex === null
                          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          : {
                              type: "spring",
                              stiffness: 260,
                              damping: 17,
                              delay: reduceMotion ? 0 : index * 0.045,
                            }
                  }
                  whileHover={
                    reduceMotion || flyingIndex !== null
                      ? undefined
                      : { y: -4, scale: 1.06 }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.84, y: -2 }}
                >
                  <CandyIcon className="w-full" tone={candy.tone} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <p className="mt-3 text-center text-xs text-ink-faint">
        {copy.hub.sweets.shakeHint}
      </p>

      <NoteOverlay open={open !== null} onClose={closeOverlay} label="A sweet">
        {open && (
          <div className="rounded-3xl border border-hairline bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
            <motion.div
              className="mx-auto mb-5 w-20"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotate: -30, scale: 0.6 }
              }
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
                onClick={openAnother}
                className="rounded-full border border-rose/40 bg-rose/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
              >
                {copy.hub.sweets.another}
              </button>
              <button
                type="button"
                onClick={closeOverlay}
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
