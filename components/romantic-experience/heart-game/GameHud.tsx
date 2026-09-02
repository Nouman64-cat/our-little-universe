"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GAME_DURATION_MS } from "@/lib/config";
import { HeartIcon } from "../ui/HeartIcon";

interface GameHudProps {
  /** Absolute timestamp (ms) when the game ends. */
  endTime: number;
  score: number;
  onExpire: () => void;
}

const TOTAL_SECONDS = Math.round(GAME_DURATION_MS / 1000);

/**
 * Time + hearts collected. The countdown owns its own ticking state so the
 * ~4 updates/second never touch the heart list or the score.
 */
function Countdown({ endTime, onExpire }: { endTime: number; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [endTime]);

  const fraction = secondsLeft / TOTAL_SECONDS;

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
      <svg viewBox="0 0 24 24" className="h-4 w-4 -rotate-90">
        <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="#ff9ec4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 9}
          strokeDashoffset={2 * Math.PI * 9 * (1 - fraction)}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>
      <span className="min-w-[1.5ch] text-sm tabular-nums text-ink-muted">{secondsLeft}s</span>
    </div>
  );
}

function GameHudComponent({ endTime, score, onExpire }: GameHudProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.25rem)] z-20 flex items-center justify-between px-5"
      aria-live="polite"
    >
      <Countdown endTime={endTime} onExpire={onExpire} />
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
        <motion.span
          key={score}
          className="block h-4 w-4 text-rose"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,158,196,0.7))" }}
        >
          <HeartIcon className="h-full w-full" />
        </motion.span>
        <span className="min-w-[1.5ch] text-sm tabular-nums text-ink-muted">{score}</span>
      </div>
    </div>
  );
}

export const GameHud = memo(GameHudComponent);
