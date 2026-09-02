"use client";

import { motion, useReducedMotion } from "motion/react";

/** Fixed, hand-tuned positions so the background is identical on server and client. */
const BLOBS = [
  { className: "left-[-20%] top-[-10%] h-[60vmin] w-[60vmin] bg-rose/20", drift: [0, 24, -12, 0], duration: 26 },
  { className: "right-[-25%] top-[20%] h-[70vmin] w-[70vmin] bg-lavender/20", drift: [0, -20, 16, 0], duration: 32 },
  { className: "bottom-[-20%] left-[10%] h-[55vmin] w-[55vmin] bg-blush/15", drift: [0, 16, -18, 0], duration: 30 },
] as const;

/** A few lily petals that drift down slowly — the flower she loves, kept faint. */
const LILY_PETALS = [
  { left: "14%", size: 26, delay: 0, duration: 26, drift: 44 },
  { left: "68%", size: 20, delay: 9, duration: 32, drift: -34 },
  { left: "44%", size: 30, delay: 17, duration: 29, drift: 26 },
] as const;

const PARTICLES = [
  { left: "12%", top: "22%", size: 3, delay: 0, duration: 11 },
  { left: "78%", top: "16%", size: 2, delay: 1.5, duration: 14 },
  { left: "64%", top: "68%", size: 4, delay: 3, duration: 12 },
  { left: "28%", top: "80%", size: 2, delay: 2, duration: 16 },
  { left: "45%", top: "40%", size: 3, delay: 4, duration: 13 },
  { left: "88%", top: "52%", size: 2, delay: 0.8, duration: 15 },
  { left: "8%", top: "55%", size: 3, delay: 2.6, duration: 12 },
] as const;

/**
 * The atmospheric layer behind every screen: a deep plum wash, a few slow
 * blurred lights, and faint drifting motes. Entirely decorative and static
 * when motion is reduced.
 */
export function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#1d1430_0%,#0c0912_60%)]" />

      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={
            reduceMotion
              ? undefined
              : { x: [...blob.drift], y: blob.drift.map((d) => d * -0.6) }
          }
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {!reduceMotion &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-blush/70"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [0, -26, 0], opacity: [0.15, 0.7, 0.15] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {!reduceMotion &&
        LILY_PETALS.map((petal, i) => (
          <motion.span
            key={`petal-${i}`}
            className="absolute -top-12 block text-blush/10"
            style={{ left: petal.left, width: petal.size, height: petal.size }}
            initial={{ y: "-12vh", rotate: 0 }}
            animate={{ y: "116vh", x: [0, petal.drift, 0], rotate: [0, 230] }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg viewBox="-12 -24 24 48" className="h-full w-full">
              <path
                d="M0,22 C 9,6 9,-14 0,-23 C -9,-14 -9,6 0,22 Z"
                fill="currentColor"
              />
            </svg>
          </motion.span>
        ))}

      {/* Gentle vignette to keep text legible against the lights. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_55%,rgba(6,4,10,0.55)_100%)]" />
    </div>
  );
}
