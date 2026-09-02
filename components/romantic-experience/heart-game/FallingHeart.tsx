"use client";

import { memo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HeartIcon } from "../ui/HeartIcon";
import type { FallingHeartData, HeartTone } from "./heart-game.types";

interface FallingHeartProps {
  heart: FallingHeartData;
  /** Playfield height in px, so the heart knows how far to fall. */
  playHeight: number;
  onCatch: (id: string, x: number, y: number) => void;
  /** Called when the heart should be removed (fell off-screen or finished its pop). */
  onRemove: (id: string) => void;
}

const TONE_GLOW: Record<HeartTone, string> = {
  rose: "drop-shadow(0 0 10px rgba(255,158,196,0.75))",
  lavender: "drop-shadow(0 0 10px rgba(193,166,255,0.7))",
  blush: "drop-shadow(0 0 10px rgba(247,201,221,0.7))",
};

/**
 * A single tappable heart. It falls with a little sway and rotation; when
 * caught it pops in place instead of continuing down. Memoised so sibling
 * spawns/removals don't re-render every heart.
 */
function FallingHeartComponent({ heart, playHeight, onCatch, onRemove }: FallingHeartProps) {
  const reduceMotion = useReducedMotion();
  const [caught, setCaught] = useState(false);
  const caughtRef = useRef(false);

  const handlePress = (event: React.PointerEvent) => {
    if (caughtRef.current) return;
    event.preventDefault();
    caughtRef.current = true;
    setCaught(true);
    onCatch(heart.id, event.clientX, event.clientY);
  };

  const fallDistance = playHeight + heart.size + 120;

  return (
    <motion.button
      type="button"
      aria-label="Catch heart"
      onPointerDown={handlePress}
      className="absolute top-0 flex touch-none items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/70"
      style={{
        left: `${heart.xPercent}%`,
        // Generous invisible padding makes the tap target thumb-friendly.
        width: heart.size + 22,
        height: heart.size + 22,
        marginLeft: -(heart.size + 22) / 2,
        filter: TONE_GLOW[heart.tone],
      }}
      initial={{ y: -heart.size - 40, opacity: 0 }}
      variants={{
        fall: {
          y: fallDistance,
          x: reduceMotion ? 0 : [0, heart.drift, -heart.drift * 0.55, heart.drift * 0.2, 0],
          rotate: reduceMotion ? 0 : [0, heart.rotation],
          opacity: 1,
        },
        caught: {
          scale: [1, 1.45, 0],
          opacity: [1, 1, 0],
          transition: { duration: 0.34, ease: "easeOut" },
        },
      }}
      animate={caught ? "caught" : "fall"}
      transition={{
        y: { duration: heart.duration, ease: "linear" },
        x: { duration: heart.duration, ease: "easeInOut" },
        rotate: { duration: heart.duration, ease: "linear" },
        opacity: { duration: 0.4 },
      }}
      onAnimationComplete={() => onRemove(heart.id)}
    >
      <span className="pointer-events-none block" style={{ width: heart.size, height: heart.size }}>
        <HeartIcon className="h-full w-full" />
      </span>
    </motion.button>
  );
}

export const FallingHeart = memo(FallingHeartComponent);
