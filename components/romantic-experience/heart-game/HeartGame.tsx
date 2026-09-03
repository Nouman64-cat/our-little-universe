"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { GAME_MAX_MISSES, HEART_SPAWN_INTERVAL_MS } from "@/lib/config";
import { createId, haptic, pickOne, randomBetween } from "@/lib/utils";
import { FallingHeart } from "./FallingHeart";
import { FloatingScore } from "./FloatingScore";
import { GameHud } from "./GameHud";
import { ParticleBurst } from "./ParticleBurst";
import { Whispers } from "./Whispers";
import type { BurstData, FallingHeartData, FloatData, HeartTone } from "./heart-game.types";

interface HeartGameProps {
  /** Receives the final tally and the longest streak once the game ends. */
  onComplete: (score: number, bestCombo: number) => void;
  /** The "tap the hearts" line at the bottom. */
  hint: string;
  /** Faint drifting lines shown mid-playfield. */
  whispers: string[];
  /** Fill the parent instead of the viewport (used inside the hub tab). */
  embedded?: boolean;
}

const TONES: HeartTone[] = ["rose", "lavender", "blush"];
/** Hard cap on simultaneous hearts to keep the DOM small on slow phones. */
const MAX_HEARTS = 18;

/** Streak → score multiplier. */
function multiplierFor(combo: number): number {
  if (combo >= 12) return 3;
  if (combo >= 5) return 2;
  return 1;
}

/** `elapsed` (seconds) ramps up the speed; gold hearts arrive once it's warm. */
function createHeart(elapsed: number, allowGold: boolean): FallingHeartData {
  const gold = allowGold && Math.random() < 0.08;
  const size = gold ? randomBetween(38, 52) : randomBetween(26, 46);
  const rush = Math.min(2, elapsed * 0.055);
  return {
    id: createId(),
    xPercent: randomBetween(8, 92),
    drift: randomBetween(-64, 64) * (1 + Math.min(0.6, elapsed * 0.02)),
    size,
    rotation: randomBetween(-150, 150),
    duration: Math.max(
      gold ? 2.2 : 2.6,
      randomBetween(4, 6.2) - (size - 26) / 40 - rush - (gold ? 0.5 : 0),
    ),
    tone: pickOne(TONES),
    kind: gold ? "gold" : "normal",
  };
}

/**
 * "Catch the Hearts" — hearts fall faster as it goes; a clean streak stacks a
 * ×2 then ×3 multiplier, and a rare golden heart is worth five. Ends after five
 * hearts slip past. Warm at any score.
 */
export function HeartGame({
  onComplete,
  hint,
  whispers,
  embedded = false,
}: HeartGameProps) {
  const reduceMotion = useReducedMotion();
  const playfieldRef = useRef<HTMLDivElement>(null);
  const shake = useAnimationControls();

  const [phase, setPhase] = useState<"playing" | "ending">("playing");
  const [hearts, setHearts] = useState<FallingHeartData[]>(() =>
    Array.from({ length: 3 }, () => createHeart(0, false)),
  );
  const [bursts, setBursts] = useState<BurstData[]>([]);
  const [floats, setFloats] = useState<FloatData[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [playHeight, setPlayHeight] = useState(0);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const caughtRef = useRef(0);
  const startRef = useRef(0);
  const endedRef = useRef(false);
  const expireTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mult = multiplierFor(combo);

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

  // Spawn hearts — the gap shrinks as time passes and as catches pile up.
  useEffect(() => {
    if (phase !== "playing") return;
    if (startRef.current === 0) startRef.current = Date.now();
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (!active) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      setHearts((current) =>
        current.length >= MAX_HEARTS
          ? current
          : [...current, createHeart(elapsed, elapsed > 2.5)],
      );
      const gap = Math.max(
        230,
        HEART_SPAWN_INTERVAL_MS - elapsed * 16 - caughtRef.current * 3,
      );
      timer = setTimeout(tick, gap);
    };
    timer = setTimeout(tick, 320);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phase]);

  const endGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPhase("ending");
    expireTimeoutRef.current = setTimeout(
      () => onComplete(scoreRef.current, bestComboRef.current),
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
    comboRef.current = 0;
    setCombo(0);
    setMisses((current) => current + 1);
    haptic([16, 45, 16]);
  }, []);

  // Out of lives — hand off to the result screen.
  useEffect(() => {
    if (misses >= GAME_MAX_MISSES) endGame();
  }, [misses, endGame]);

  const handleCatch = useCallback(
    (_id: string, clientX: number, clientY: number, kind: FallingHeartData["kind"]) => {
      caughtRef.current += 1;
      const nextCombo = comboRef.current + 1;
      comboRef.current = nextCombo;
      setCombo(nextCombo);
      if (nextCombo > bestComboRef.current) bestComboRef.current = nextCombo;

      const gained = (kind === "gold" ? 5 : 1) * multiplierFor(nextCombo);
      scoreRef.current += gained;
      setScore(scoreRef.current);

      haptic(kind === "gold" ? [12, 26, 12, 26, 14] : Math.min(24, 7 + nextCombo));

      if (!reduceMotion && (kind === "gold" || nextCombo === 5 || nextCombo === 12)) {
        shake.start({
          x: [0, -5, 5, -3, 2, 0],
          transition: { duration: 0.34, ease: "easeInOut" },
        });
      }

      if (reduceMotion) return;
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const burstId = createId();
      setBursts((current) => [
        ...current,
        {
          id: burstId,
          x,
          y,
          intensity: Math.min(3, 1 + Math.floor(nextCombo / 4)),
          gold: kind === "gold",
        },
      ]);
      setFloats((current) => [
        ...current,
        { id: createId(), x, y, text: `+${gained}`, gold: kind === "gold" },
      ]);
    },
    [reduceMotion, shake],
  );

  const handleRemoveHeart = useCallback((id: string) => {
    setHearts((current) => current.filter((heart) => heart.id !== id));
  }, []);

  const dropBurst = useCallback((id: string) => {
    setBursts((current) => current.filter((b) => b.id !== id));
  }, []);

  const dropFloat = useCallback((id: string) => {
    setFloats((current) => current.filter((f) => f.id !== id));
  }, []);

  return (
    <motion.div
      ref={playfieldRef}
      animate={shake}
      className={[
        "relative w-full touch-none select-none overflow-hidden",
        embedded ? "h-full" : "h-dvh",
      ].join(" ")}
    >
      <GameHud misses={misses} score={score} multiplier={mult} embedded={embedded} />

      {/* streak "heat" — a glow that swells as the multiplier climbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            mult >= 3
              ? "radial-gradient(120% 60% at 50% 100%, rgba(255,206,120,0.22), transparent 70%)"
              : "radial-gradient(120% 55% at 50% 100%, rgba(255,158,196,0.2), transparent 70%)",
        }}
        animate={
          reduceMotion || mult < 2
            ? { opacity: 0 }
            : { opacity: mult >= 3 ? [0.55, 1, 0.55] : [0.35, 0.7, 0.35] }
        }
        transition={{ duration: mult >= 3 ? 1 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

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

      {/* streak badge — pops on each catch once the run is going */}
      <AnimatePresence>
        {combo >= 3 && phase === "playing" && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-[38%] z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
          >
            <motion.span
              key={combo}
              className="font-display text-4xl font-semibold"
              style={{
                color: mult >= 3 ? "#ffce54" : "var(--color-rose-bright)",
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
              initial={reduceMotion ? {} : { scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 460, damping: 16 }}
            >
              ×{mult}
            </motion.span>
            <span className="mt-0.5 text-[11px] uppercase tracking-[0.3em] text-ink-faint">
              {combo} streak
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <p
        className={[
          "pointer-events-none absolute inset-x-0 z-10 text-center text-xs uppercase tracking-[0.3em] text-ink-faint",
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
            intensity={burst.intensity}
            gold={burst.gold}
            onDone={() => dropBurst(burst.id)}
          />
        ))}
      </AnimatePresence>

      {floats.map((float) => (
        <FloatingScore
          key={float.id}
          x={float.x}
          y={float.y}
          text={float.text}
          gold={float.gold}
          onDone={() => dropFloat(float.id)}
        />
      ))}
    </motion.div>
  );
}
