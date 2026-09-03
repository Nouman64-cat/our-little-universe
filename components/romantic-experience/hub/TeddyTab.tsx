"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { createId, haptic } from "@/lib/utils";
import { HeartIcon } from "../ui/HeartIcon";
import { useKeepsakes } from "./keepsake-context";
import { TabScreen } from "./ui/TabScreen";
import { TeddyScene } from "./TeddyScene";

interface FloatHeart {
  id: string;
  x: number;
}

/** The two of them, a bear pair cuddled up in a cosy nook. Tap for a hug. */
export function TeddyTab() {
  const reduceMotion = useReducedMotion();
  const { hugsSent, sendHug, randomTeddyLine } = useKeepsakes();

  const [line, setLine] = useState(() => randomTeddyLine());
  const [pose, setPose] = useState<"idle" | "hug">("idle");
  const [blink, setBlink] = useState(false);
  const [hearts, setHearts] = useState<FloatHeart[]>([]);
  const [flash, setFlash] = useState(false);
  const poseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Idle blink.
  useEffect(() => {
    if (reduceMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        scheduleBlink();
      }, 2600 + Math.random() * 3600);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [reduceMotion]);

  // Rotate the sign text on a slow timer.
  useEffect(() => {
    const id = setInterval(() => setLine(randomTeddyLine()), 6500);
    return () => clearInterval(id);
  }, [randomTeddyLine]);

  useEffect(() => {
    return () => {
      if (poseTimer.current) clearTimeout(poseTimer.current);
    };
  }, []);

  const triggerHug = useCallback(
    (big: boolean) => {
      setPose("hug");
      setLine(randomTeddyLine());
      if (poseTimer.current) clearTimeout(poseTimer.current);
      poseTimer.current = setTimeout(() => setPose("idle"), big ? 1200 : 900);

      const count = big ? 7 : 3;
      setHearts((current) => [
        ...current,
        ...Array.from({ length: count }, () => ({
          id: createId(),
          x: (Math.random() - 0.5) * (big ? 170 : 100),
        })),
      ]);

      if (big) {
        sendHug();
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
        haptic([12, 30, 14]);
      } else {
        haptic(8);
      }
    },
    [randomTeddyLine, sendHug],
  );

  return (
    <TabScreen bare>
      <div className="relative min-h-dvh w-full overflow-hidden">
        <button
          type="button"
          onClick={() => triggerHug(false)}
          aria-label="Hug the teddies"
          className="absolute inset-0 block cursor-pointer focus-visible:outline-none"
        >
          <TeddyScene pose={pose} blink={blink} />
        </button>

        <AnimatePresence>
          {flash && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-rose/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* rising hearts, from between the two bears */}
        <div className="pointer-events-none absolute inset-x-0 top-[52%] flex justify-center">
          <AnimatePresence>
            {hearts.map((heart) => (
              <motion.span
                key={heart.id}
                className="absolute h-5 w-5 text-rose"
                initial={{ opacity: 0.9, x: heart.x, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -170, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setHearts((current) => current.filter((item) => item.id !== heart.id))
                }
              >
                <HeartIcon className="h-full w-full" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* scrims for the floated chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/22 via-black/8 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/35 via-black/12 to-transparent" />

        {/* title + rotating sign */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-center"
        >
          <h1 className="font-display text-2xl font-medium text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
            {copy.hub.teddy.title}
          </h1>
          <div className="mt-2 min-h-[1.75rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={line}
                className="font-display text-sm italic text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                suppressHydrationWarning
              >
                {line}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* hug control */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
          className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] flex flex-col items-center gap-2 px-6"
        >
          <button
            type="button"
            onClick={() => triggerHug(true)}
            className="min-h-[52px] rounded-full border border-rose/50 bg-rose/25 px-8 py-3.5 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-rose/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          >
            {copy.hub.teddy.hug} ♡
          </button>
          <p className="h-5 text-xs text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
            {hugsSent > 0 ? copy.hub.teddy.hugged(hugsSent) : ""}
          </p>
        </motion.div>
      </div>
    </TabScreen>
  );
}
