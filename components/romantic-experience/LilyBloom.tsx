"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";

interface LilyBloomProps {
  className?: string;
  /** Start the bloom. When false the flower stays closed. */
  play?: boolean;
}

const PETAL_PATH = "M0,1 C 9,-11 9,-32 0,-45 C -9,-32 -9,-11 0,1 Z";
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];
const STAMEN_ANGLES = [30, 90, 150, 210, 270, 330];

/**
 * A lily that opens from a bud: each petal unfurls from the centre with a
 * short stagger, then the stamens fade in. Under reduced motion it simply
 * fades in fully open. Purely decorative.
 */
export function LilyBloom({ className, play = true }: LilyBloomProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();

  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="62%" r="68%">
          <stop offset="0%" stopColor="#fff7fb" />
          <stop offset="55%" stopColor="#f9cfe0" />
          <stop offset="100%" stopColor="#d3b4ff" />
        </radialGradient>
      </defs>

      <g>
        {PETAL_ANGLES.map((angle, index) => {
          const openOpacity = angle % 120 === 0 ? 0.96 : 0.8;
          return (
            <motion.path
              key={angle}
              d={PETAL_PATH}
              fill={`url(#${gradientId})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={0.75}
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              initial={{
                opacity: 0,
                scale: reduceMotion ? 1 : 0.12,
                rotate: reduceMotion ? angle : angle - 42,
              }}
              animate={
                play
                  ? { opacity: openOpacity, scale: 1, rotate: angle }
                  : { opacity: 0, scale: reduceMotion ? 1 : 0.12, rotate: angle - 42 }
              }
              transition={
                reduceMotion
                  ? { duration: 0.4, delay: index * 0.04 }
                  : { duration: 0.9, ease: EASE_SOFT, delay: index * 0.08 }
              }
            />
          );
        })}
      </g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: play ? 1 : 0 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0.2 : 0.7 }}
      >
        <g stroke="#eec987" strokeWidth={1.4} strokeLinecap="round">
          {STAMEN_ANGLES.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={0}
                y1={0}
                x2={Math.sin(rad) * 15}
                y2={-Math.cos(rad) * 15}
              />
            );
          })}
        </g>
        {STAMEN_ANGLES.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <circle
              key={angle}
              cx={Math.sin(rad) * 16.5}
              cy={-Math.cos(rad) * 16.5}
              r={2.2}
              fill="#e6bd78"
            />
          );
        })}
        <circle cx={0} cy={0} r={3} fill="#ffe9c8" />
      </motion.g>
    </svg>
  );
}
