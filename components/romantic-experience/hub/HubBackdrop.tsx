"use client";

import { motion, useReducedMotion } from "motion/react";

/** Fixed, hand-tuned positions so the wash is identical on server and client. */
const BLOBS = [
  { className: "left-[-20%] top-[-10%] h-[58vmin] w-[58vmin] bg-rose/15", drift: [0, 22, -10, 0], duration: 28 },
  { className: "right-[-25%] top-[18%] h-[66vmin] w-[66vmin] bg-lavender/15", drift: [0, -18, 14, 0], duration: 34 },
  { className: "bottom-[-22%] left-[8%] h-[54vmin] w-[54vmin] bg-blush/12", drift: [0, 14, -16, 0], duration: 31 },
] as const;

/**
 * The hub's own atmospheric layer. Opaque `bg-canvas` base (so it covers the
 * journey's darker `AmbientBackground` underneath) plus a few slow, blurred
 * lights that resolve their colour from the active theme.
 */
export function HubBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--color-rose) 14%, var(--color-canvas)), var(--color-canvas) 62%)",
        }}
      />

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

      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 58%, color-mix(in srgb, var(--color-canvas) 70%, black) 100%)",
        }}
      />
    </div>
  );
}
