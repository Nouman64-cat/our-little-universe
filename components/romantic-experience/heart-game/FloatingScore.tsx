"use client";

import { memo } from "react";
import { motion } from "motion/react";

interface FloatingScoreProps {
  x: number;
  y: number;
  text: string;
  gold?: boolean;
  onDone: () => void;
}

/** A "+N" that floats up and fades from a catch point. */
function FloatingScoreComponent({ x, y, text, gold = false, onDone }: FloatingScoreProps) {
  return (
    <motion.span
      className="pointer-events-none absolute -translate-x-1/2 text-sm font-semibold tabular-nums"
      style={{
        left: x,
        top: y,
        color: gold ? "#ffce54" : "var(--color-rose-bright)",
        textShadow: "0 1px 8px rgba(0,0,0,0.35)",
      }}
      initial={{ y: 0, opacity: 0, scale: 0.6 }}
      animate={{ y: -46, opacity: [0, 1, 1, 0], scale: gold ? 1.25 : 1 }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      onAnimationComplete={onDone}
    >
      {text}
    </motion.span>
  );
}

export const FloatingScore = memo(FloatingScoreComponent);
