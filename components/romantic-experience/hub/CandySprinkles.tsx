"use client";

import { memo, useState } from "react";
import { motion } from "motion/react";

const COLORS = ["#ff9ec4", "#c1a6ff", "#f0d29b", "#8fd7bd", "#ffd7e8", "#ffe9c3"];

/** A confetti burst of little candy-coloured bits from the centre point. */
function CandySprinklesComponent({
  count = 22,
  onDone,
}: {
  count?: number;
  onDone?: () => void;
}) {
  const [bits] = useState(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 44 + Math.random() * 96;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 24,
        rot: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        long: Math.random() > 0.5,
        delay: Math.random() * 0.08,
        dur: 0.95 + Math.random() * 0.4,
      };
    }),
  );

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.long ? 3 : 5,
            height: b.long ? 9 : 5,
            background: b.color,
            marginLeft: b.long ? -1.5 : -2.5,
            marginTop: b.long ? -4.5 : -2.5,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: b.dx,
            y: [b.dy, b.dy + 130],
            opacity: [1, 1, 0],
            rotate: b.rot,
            scale: 0.7,
          }}
          transition={{ duration: b.dur, ease: "easeOut", delay: b.delay }}
          onAnimationComplete={i === 0 ? onDone : undefined}
        />
      ))}
    </div>
  );
}

export const CandySprinkles = memo(CandySprinklesComponent);
