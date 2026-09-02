"use client";

import { memo } from "react";
import { motion } from "motion/react";

interface ParticleBurstProps {
  x: number;
  y: number;
  onDone: () => void;
}

const PARTICLES = Array.from({ length: 7 }, (_, i) => {
  const angle = (i / 7) * Math.PI * 2 + Math.random();
  const distance = 26 + Math.random() * 22;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    size: 3 + Math.random() * 3,
  };
});

/**
 * A tiny sparkle burst at the point a heart was caught. Fully self-contained:
 * it reports back via `onDone` once its animation finishes so the parent can
 * drop it from state.
 */
function ParticleBurstComponent({ x, y, onDone }: ParticleBurstProps) {
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y }}>
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-blush"
          style={{ width: particle.size, height: particle.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: particle.dx, y: particle.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          onAnimationComplete={index === 0 ? onDone : undefined}
        />
      ))}
    </div>
  );
}

export const ParticleBurst = memo(ParticleBurstComponent);
