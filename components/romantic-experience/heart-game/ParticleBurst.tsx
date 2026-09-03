"use client";

import { memo, useState } from "react";
import { motion } from "motion/react";

interface ParticleBurstProps {
  x: number;
  y: number;
  /** 1 = single catch; higher (mid-combo) throws more, further. */
  intensity?: number;
  gold?: boolean;
  onDone: () => void;
}

/**
 * A sparkle burst at the point a heart was caught. Fully self-contained: it
 * reports back via `onDone` once its animation finishes so the parent can drop
 * it from state. Bursts bigger with combo, and turns gold for bonus hearts.
 */
function ParticleBurstComponent({ x, y, intensity = 1, gold = false, onDone }: ParticleBurstProps) {
  const [particles] = useState(() => {
    const count = Math.round(6 + intensity * 3 + (gold ? 6 : 0));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random();
      const distance = (gold ? 34 : 24) + Math.random() * (18 + intensity * 8);
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: (gold ? 3.5 : 2.5) + Math.random() * (2 + intensity),
      };
    });
  });

  const color = gold ? "bg-honey" : "bg-blush";

  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y }}>
      {gold && (
        <motion.span
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            background: "radial-gradient(circle, rgba(255,214,120,0.9), transparent 70%)",
          }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 7, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full ${color}`}
          style={{ width: particle.size, height: particle.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: particle.dx, y: particle.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.55 + intensity * 0.05, ease: "easeOut" }}
          onAnimationComplete={index === 0 ? onDone : undefined}
        />
      ))}
    </div>
  );
}

export const ParticleBurst = memo(ParticleBurstComponent);
