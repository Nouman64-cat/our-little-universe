"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { hashString, todayKey } from "@/lib/daily";
import { clamp, haptic, pickOne } from "@/lib/utils";
import { CandyIcon, type CandyShape, type CandyTone } from "../ui/CandyIcon";
import { useKeepsakes } from "./keepsake-context";
import { CandyUnwrap } from "./CandyUnwrap";
import { TabScreen } from "./ui/TabScreen";

interface Candy {
  x: number;
  y: number;
  rot: number;
  tone: CandyTone;
  shape: CandyShape;
}

/** Fixed candy pile — hand-placed (percent of the inner jar), piled toward the
 *  bottom so the jar reads as full. */
const CANDIES: Candy[] = [
  { x: 6, y: 88, rot: -16, tone: "pink", shape: "wrapped" },
  { x: 32, y: 92, rot: 10, tone: "lilac", shape: "gummy" },
  { x: 58, y: 89, rot: 22, tone: "honey", shape: "wrapped" },
  { x: 19, y: 74, rot: 12, tone: "mint", shape: "choc" },
  { x: 45, y: 72, rot: -10, tone: "pink", shape: "lollipop" },
  { x: 68, y: 74, rot: 18, tone: "lilac", shape: "wrapped" },
  { x: 33, y: 56, rot: 14, tone: "honey", shape: "cane" },
  { x: 7, y: 58, rot: -8, tone: "pink", shape: "gummy" },
  { x: 58, y: 56, rot: 10, tone: "mint", shape: "wrapped" },
  { x: 20, y: 39, rot: -20, tone: "lilac", shape: "lollipop" },
  { x: 45, y: 37, rot: 6, tone: "honey", shape: "wrapped" },
  { x: 68, y: 39, rot: -14, tone: "pink", shape: "choc" },
  { x: 30, y: 21, rot: 16, tone: "mint", shape: "gummy" },
  { x: 9, y: 24, rot: -10, tone: "pink", shape: "wrapped" },
  { x: 54, y: 20, rot: -22, tone: "lilac", shape: "cane" },
  { x: 38, y: 5, rot: 8, tone: "honey", shape: "wrapped" },
];

/** The candy that carries today's sweet, when it's still in the jar. */
const DAY_CANDY_INDEX = 6;

/** Which candy is the rare golden one today (never the day candy). */
function foilIndexFor(day: string): number {
  const i = hashString(`foil-${day}`) % CANDIES.length;
  return i === DAY_CANDY_INDEX ? (i + 1) % CANDIES.length : i;
}

/** Where a candy sits after `shakes` shakes — a seeded jostle within the jar. */
function placed(index: number, shakes: number): Candy {
  const base = CANDIES[index];
  if (shakes === 0) return base;
  const h = hashString(`s${index}-${shakes}`);
  return {
    ...base,
    x: clamp(base.x + ((h % 11) - 5), 2, 76),
    y: clamp(base.y + (((h >> 5) % 13) - 6), 4, 92),
    rot: base.rot + (((h >> 10) % 55) - 27),
  };
}

interface OpenSweet {
  text: string;
  ofDay: boolean;
  foil: boolean;
  tone: CandyTone;
  shape: CandyShape;
}

/**
 * The sweet jar: shake it, then pick a candy. Each one you take is unwrapped —
 * a shower of sprinkles, a heart inside, the sweet's words. Empty the jar and it
 * quietly refills; a rare golden candy hides an extra-sweet one.
 */
export function SweetsTab() {
  const reduceMotion = useReducedMotion();
  const {
    sweetOfDay,
    sweetTaken,
    takeSweetOfDay,
    randomSweet,
    takenSweets,
    takeSweet,
    refillJar,
  } = useKeepsakes();

  const today = todayKey();
  const foilIndex = foilIndexFor(today);

  const [openSweet, setOpenSweet] = useState<OpenSweet | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [shakes, setShakes] = useState(0);
  const [refilled, setRefilled] = useState(false);
  const refillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jarControls = useAnimationControls();

  useEffect(
    () => () => {
      if (refillTimer.current) clearTimeout(refillTimer.current);
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    [],
  );

  const present = CANDIES.map((_, i) => i).filter((i) => !takenSweets.includes(i));
  const dayGlowIndex = sweetTaken
    ? null
    : present.includes(DAY_CANDY_INDEX)
      ? DAY_CANDY_INDEX
      : (present[0] ?? null);

  /** Once this take would clear the jar, schedule a fresh one. */
  const scheduleRefillIfEmpty = (justTook: number) => {
    const remaining = present.filter((i) => i !== justTook).length;
    if (remaining > 0 || refillTimer.current) return;
    refillTimer.current = setTimeout(() => {
      refillTimer.current = null;
      refillJar();
      setShakes(0);
      setRefilled(true);
      setTimeout(() => setRefilled(false), 2800);
    }, 900);
  };

  const reveal = (sweet: OpenSweet) => {
    setOpenSweet(sweet);
    setRevealKey((k) => k + 1);
  };

  const takeCandy = (index: number) => {
    if (openSweet || takenSweets.includes(index)) return;
    const isDay = index === dayGlowIndex;
    const isFoil = index === foilIndex;
    haptic(isDay || isFoil ? 10 : 6);
    takeSweet(index);
    if (isDay && !sweetTaken) takeSweetOfDay();
    scheduleRefillIfEmpty(index);
    const candy = CANDIES[index];
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(
      () =>
        reveal({
          text: isDay ? sweetOfDay : randomSweet(),
          ofDay: isDay,
          foil: isFoil,
          tone: candy.tone,
          shape: candy.shape,
        }),
      reduceMotion ? 0 : 240,
    );
  };

  const openAnother = () => {
    haptic(6);
    const pickable = present.filter((i) => !(i === dayGlowIndex && !sweetTaken));
    const pick = pickable.length > 0 ? pickOne(pickable) : null;
    if (pick !== null) {
      takeSweet(pick);
      scheduleRefillIfEmpty(pick);
    }
    const candy = pick !== null ? CANDIES[pick] : CANDIES[0];
    reveal({
      text: randomSweet(),
      ofDay: false,
      foil: pick === foilIndex,
      tone: candy.tone,
      shape: candy.shape,
    });
  };

  const closeOverlay = () => setOpenSweet(null);

  const shakeJar = () => {
    if (openSweet) return;
    haptic([8, 26, 10]);
    if (!reduceMotion) {
      jarControls.start({
        rotate: [0, -5, 4, -3.5, 2, -1, 0],
        x: [0, -7, 7, -5, 3, 0],
        transition: { duration: 0.62, ease: "easeInOut" },
      });
    }
    setShakes((s) => s + 1);
  };

  const lidTilt = openSweet
    ? { rotate: -15, y: -16, x: 7 }
    : sweetTaken
      ? { rotate: -5, y: -3, x: 2 }
      : { rotate: 0, y: 0, x: 0 };

  const topLine = refilled
    ? copy.hub.sweets.refilled
    : sweetTaken
      ? copy.hub.sweets.taken
      : copy.hub.sweets.glowing;

  const canTakeMore = present.length > 0;

  return (
    <TabScreen title={copy.hub.sweets.title} subtitle={copy.hub.sweets.subtitle}>
      <p className="mb-4 text-sm text-ink-faint" suppressHydrationWarning>
        {topLine}
      </p>

      <div className="my-auto">
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[22rem]">
        <motion.div className="absolute inset-0" animate={jarControls}>
          {/* jar body + glass shine */}
          <div className="absolute inset-x-2 top-6 bottom-0 overflow-hidden rounded-b-[2.5rem] rounded-t-2xl border border-hairline-strong bg-surface backdrop-blur-md">
            <div className="absolute left-5 top-8 bottom-8 w-3 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
            <div className="absolute right-6 top-6 h-16 w-1.5 rounded-full bg-white/15" />
            {/* slow sugar dust */}
            {!reduceMotion &&
              [
                { x: "22%", y: "30%", d: 5 },
                { x: "68%", y: "48%", d: 7 },
                { x: "44%", y: "18%", d: 6 },
              ].map((m, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-white/30"
                  style={{ left: m.x, top: m.y }}
                  animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: m.d, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
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
          <div className="pointer-events-none absolute inset-x-5 bottom-5 top-9 z-10">
            <AnimatePresence>
              {CANDIES.map((_, index) => {
                if (takenSweets.includes(index)) return null;
                const c = placed(index, shakes);
                const isDay = index === dayGlowIndex;
                const isFoil = index === foilIndex;

                return (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => takeCandy(index)}
                    aria-label={
                      isDay
                        ? "Take today's sweet"
                        : isFoil
                          ? "Take the golden sweet"
                          : "Take a sweet"
                    }
                    className="pointer-events-auto absolute w-[20%] min-w-[42px] max-w-[54px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
                    style={{
                      filter: isDay
                        ? "drop-shadow(0 0 12px rgba(255,158,196,0.85))"
                        : isFoil
                          ? "drop-shadow(0 0 12px rgba(233,192,74,0.9))"
                          : "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
                    }}
                    initial={
                      reduceMotion
                        ? { opacity: 0, left: `${c.x}%`, top: `${c.y}%`, rotate: c.rot }
                        : {
                            opacity: 0,
                            left: `${c.x}%`,
                            top: `${c.y}%`,
                            y: -170 - index * 6,
                            rotate: c.rot - 40,
                          }
                    }
                    animate={{
                      opacity: 1,
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      y:
                        reduceMotion || shakes === 0
                          ? 0
                          : [0, -(6 + (hashString(`h${index}${shakes}`) % 10)), 0],
                      rotate: c.rot,
                      scale:
                        isDay && !reduceMotion && !sweetTaken
                          ? [1, 1.08, 1]
                          : isFoil && !reduceMotion
                            ? [1, 1.06, 1]
                            : 1,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0, y: -26, rotate: c.rot + 90 }
                    }
                    transition={{
                      default: {
                        type: "spring",
                        stiffness: 240,
                        damping: 16,
                        delay: reduceMotion ? 0 : shakes === 0 ? index * 0.04 : 0,
                      },
                      scale:
                        (isDay || isFoil) && !reduceMotion
                          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          : { type: "spring", stiffness: 240, damping: 16 },
                    }}
                    whileHover={reduceMotion ? undefined : { y: -5, scale: 1.07 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.82, y: -2 }}
                  >
                    <CandyIcon
                      className="w-full"
                      tone={c.tone}
                      shape={c.shape}
                      foil={isFoil}
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
        </div>

        <p className="mt-3 text-center text-xs text-ink-faint">
          {copy.hub.sweets.shakeHint}
        </p>
      </div>

      <CandyUnwrap
        open={openSweet !== null}
        revealKey={revealKey}
        text={openSweet?.text ?? ""}
        ofDay={openSweet?.ofDay ?? false}
        foil={openSweet?.foil ?? false}
        tone={openSweet?.tone ?? "pink"}
        shape={openSweet?.shape ?? "wrapped"}
        canTakeMore={canTakeMore}
        onAnother={openAnother}
        onClose={closeOverlay}
      />
    </TabScreen>
  );
}
