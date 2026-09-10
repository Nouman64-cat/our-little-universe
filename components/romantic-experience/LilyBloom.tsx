"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";
import {
  LILY_VIEWBOX,
  LilyCentre,
  LilyGradient,
  LilyPetal,
  PETAL_ANGLES,
  isInnerPetal,
  type LilyTone,
} from "./lily-shape";

interface LilyBloomProps {
  className?: string;
  /** Start the bloom. When false the flower stays closed. */
  play?: boolean;
  /** Petal colouring — a speckled pink stargazer by default, or a cream lily. */
  tone?: LilyTone;
}

/**
 * A stargazer lily that opens from a bud: the outer whorl unfurls first, then
 * the inner, each tepal swinging down and out from the centre with a short
 * stagger, then the stamens fade in. Under reduced motion it simply fades in
 * fully open. Purely decorative.
 */
export function LilyBloom({ className, play = true, tone = "blush" }: LilyBloomProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();

  // Draw the outer whorl first so the inner tepals overlap it.
  const order = [...PETAL_ANGLES.keys()].sort(
    (a, b) => Number(isInnerPetal(a)) - Number(isInnerPetal(b)),
  );

  return (
    <svg viewBox={LILY_VIEWBOX} className={className} aria-hidden>
      <defs>
        <LilyGradient id={gradientId} tone={tone} />
      </defs>

      {order.map((index, drawn) => {
        const angle = PETAL_ANGLES[index];
        const closedRotate = reduceMotion ? angle : angle - 46;
        const closedScale = reduceMotion ? 1 : 0.14;
        return (
          <motion.g
            key={angle}
            style={{ transformBox: "view-box", transformOrigin: "0px 0px" }}
            initial={{ opacity: 0, scale: closedScale, rotate: closedRotate }}
            animate={
              play
                ? { opacity: 1, scale: 1, rotate: angle }
                : { opacity: 0, scale: closedScale, rotate: closedRotate }
            }
            transition={
              reduceMotion
                ? { duration: 0.4, delay: drawn * 0.04 }
                : { duration: 0.9, ease: EASE_SOFT, delay: drawn * 0.08 }
            }
          >
            <LilyPetal index={index} gradientId={gradientId} tone={tone} />
          </motion.g>
        );
      })}

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: play ? 1 : 0 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0.2 : 0.7 }}
      >
        <LilyCentre />
      </motion.g>
    </svg>
  );
}
