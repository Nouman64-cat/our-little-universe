"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GAME_MAX_MISSES, HEART_SPAWN_INTERVAL_MS } from "@/lib/config";
import { createId, haptic, pickOne, randomBetween } from "@/lib/utils";
import { FallingHeart } from "./FallingHeart";
import { GameHud } from "./GameHud";
import { ParticleBurst } from "./ParticleBurst";
import { Whispers } from "./Whispers";
import type { BurstData, FallingHeartData, HeartTone } from "./heart-game.types";

interface HeartGameProps {
  /** Receives the final tally once the 15 seconds are up. */
  onComplete: (score: number) => void;
  /** The "tap the hearts" line at the bottom. */
  hint: string;
  /** Faint drifting lines shown mid-playfield. */
  whispers: string[];
  /** Fill the parent instead of the viewport (used inside the hub tab). */
  embedded?: boolean;
}

const TONES: HeartTone[] = ["rose", "lavender", "blush"];
/** Hard cap on simultaneous hearts to keep the DOM small on slow phones. */
const MAX_HEARTS = 16;

function createHeart(): FallingHeartData {
  const size = randomBetween(26, 46);
  return {
    id: createId(),
    xPercent: randomBetween(8, 92),
    drift: randomBetween(-64, 64),
    size,
    rotation: randomBetween(-150, 150),
    // Bigger hearts drift down a little slower; all kept slow enough to tap.
    duration: randomBetween(4, 6.2) - (size - 26) / 40,
    tone: pickOne(TONES),
  };
}

/**
 * "Catch the Hearts" — a 15-second mini-game. Hearts spawn on a timer and fall
 * with organic variation; tapping one pops it and scores a point. Never
 * competitive: the result screen is warm regardless of the count.
 */
export function HeartGame({
  onComplete,
  hint,
  whispers,
  embedded = false,
}: HeartGameProps) {
  const reduceMotion = useReducedMotion();
  const playfieldRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"playing" | "ending">("playing");
  const [hearts, setHearts] = useState<FallingHeartData[]>(() =>
    Array.from({ length: 3 }, createHeart),
  );
  const [bursts, setBursts] = useState<BurstData[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [playHeight, setPlayHeight] = useState(0);

  const scoreRef = useRef(0);
  const endedRef = useRef(false);
  const expireTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lock page scrolling for the duration of the game so taps never pan the page.
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousOverscroll = body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overflow = previousOverflow;
      body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  // Track playfield height so hearts fall exactly off the bottom edge.
  useEffect(() => {
    const measure = () => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (rect) setPlayHeight(rect.height);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Spawn hearts while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setHearts((current) =>
        current.length >= MAX_HEARTS ? current : [...current, createHeart()],
      );
    }, HEART_SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [phase]);

  const endGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPhase("ending");
    // Let the last hearts drift a moment before the hand-off.
    expireTimeoutRef.current = setTimeout(
      () => onComplete(scoreRef.current),
      embedded ? 550 : 900,
    );
  }, [onComplete, embedded]);

  useEffect(() => {
    return () => {
      if (expireTimeoutRef.current) clearTimeout(expireTimeoutRef.current);
    };
  }, []);

  const handleMiss = useCallback((id: string) => {
    setHearts((current) => current.filter((heart) => heart.id !== id));
    if (endedRef.current) return;
    setMisses((current) => current + 1);
    // A heavier double-buzz than a catch, so a slip past is felt, not just seen.
    haptic([16, 45, 16]);
  }, []);

  // Out of lives — hand off to the result screen.
  useEffect(() => {
    if (misses >= GAME_MAX_MISSES) endGame();
  }, [misses, endGame]);

  const handleCatch = useCallback(
    (_id: string, clientX: number, clientY: number) => {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      haptic(9);

      if (reduceMotion) return;
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      setBursts((current) => [
        ...current,
        { id: createId(), x: clientX - rect.left, y: clientY - rect.top },
      ]);
    },
    [reduceMotion],
  );

  const handleRemoveHeart = useCallback((id: string) => {
    setHearts((current) => current.filter((heart) => heart.id !== id));
  }, []);

  const handleRemoveBurst = useCallback((id: string) => {
    setBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  return (
    <div
      ref={playfieldRef}
      className={[
        "relative w-full touch-none select-none overflow-hidden",
        embedded ? "h-full" : "h-dvh",
      ].join(" ")}
    >
      <GameHud misses={misses} score={score} embedded={embedded} />

      {/* A soft red wash up from the bottom edge the instant a heart slips past. */}
      <AnimatePresence>
        {misses > 0 && phase === "playing" && (
          <motion.div
            key={misses}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-rose/35 to-transparent"
            initial={{ opacity: reduceMotion ? 0.5 : 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <Whispers lines={whispers} />

      <p
        className={[
          "pointer-events-none absolute inset-x-0 text-center text-xs uppercase tracking-[0.3em] text-ink-faint",
          embedded ? "bottom-4" : "bottom-[calc(env(safe-area-inset-bottom)+2rem)]",
        ].join(" ")}
      >
        {hint}
      </p>

      {playHeight > 0 &&
        hearts.map((heart) => (
          <FallingHeart
            key={heart.id}
            heart={heart}
            playHeight={playHeight}
            onCatch={handleCatch}
            onRemove={handleRemoveHeart}
            onMiss={handleMiss}
          />
        ))}

      <AnimatePresence>
        {bursts.map((burst) => (
          <ParticleBurst
            key={burst.id}
            x={burst.x}
            y={burst.y}
            onDone={() => handleRemoveBurst(burst.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
