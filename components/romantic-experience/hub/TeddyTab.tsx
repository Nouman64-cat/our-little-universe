"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { createId, haptic } from "@/lib/utils";
import { HeartIcon } from "../ui/HeartIcon";
import { TeddyIcon } from "../ui/TeddyIcon";
import { useKeepsakes } from "./keepsake-context";
import { TabScreen } from "./ui/TabScreen";

interface FloatHeart {
  id: string;
  x: number;
}

/** A cuddly companion: tap for a hug, hold a rotating sign, take hugs from her. */
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
      poseTimer.current = setTimeout(() => setPose("idle"), big ? 1100 : 850);

      const count = big ? 6 : 3;
      setHearts((current) => [
        ...current,
        ...Array.from({ length: count }, () => ({
          id: createId(),
          x: (Math.random() - 0.5) * (big ? 150 : 90),
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
    <TabScreen title={copy.hub.teddy.title}>
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <AnimatePresence>
          {flash && (
            <motion.div
              className="pointer-events-none fixed inset-0 z-0 bg-rose/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* sign */}
        <div className="mb-6 min-h-[3rem] max-w-[16rem] rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-center backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              className="font-display text-sm italic text-ink-muted"
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

        {/* teddy */}
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => triggerHug(false)}
            aria-label="Hug the teddy"
            className="block w-52 max-w-[60vw] rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
            animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <TeddyIcon className="w-full" pose={pose} blink={blink} />
          </motion.button>

          {/* rising hearts */}
          <AnimatePresence>
            {hearts.map((heart) => (
              <motion.span
                key={heart.id}
                className="pointer-events-none absolute left-1/2 top-6 h-5 w-5 text-rose"
                initial={{ opacity: 0.9, x: heart.x, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -140, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setHearts((current) => current.filter((item) => item.id !== heart.id))
                }
              >
                <HeartIcon className="h-full w-full" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => triggerHug(true)}
          className="relative mt-10 min-h-[52px] rounded-full border border-rose/40 bg-rose/15 px-8 py-3.5 text-base font-medium text-ink backdrop-blur-md transition-colors hover:bg-rose/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          {copy.hub.teddy.hug} ♡
        </button>

        <p className="mt-4 h-5 text-sm text-ink-faint">
          {hugsSent > 0 ? copy.hub.teddy.hugged(hugsSent) : ""}
        </p>
      </div>
    </TabScreen>
  );
}
