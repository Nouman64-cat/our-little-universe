"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, haptic } from "@/lib/utils";

interface Options {
  /** Continuous hold time required to complete, in milliseconds. */
  durationMs: number;
  /** Fired once, the moment progress first reaches 100%. */
  onComplete: () => void;
}

interface HoldProgress {
  /** 0 → 1 fill amount. */
  progress: number;
  /** True while the pointer is actively pressing. */
  isHolding: boolean;
  /** True once the hold has been completed (stays true until reset). */
  isComplete: boolean;
  /** Spread onto the element that should receive the press. */
  handlers: {
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
  };
}

/** When released early, progress drains this many times faster than it filled. */
const RELEASE_MULTIPLIER = 2.1;

/**
 * Drives a "press and hold" interaction with a single rAF loop: progress rises
 * while held and eases back to zero when released early, without ever punishing
 * the user. Completion fires exactly once.
 */
export function useHoldProgress({ durationMs, onComplete }: Options): HoldProgress {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Refs mirror state so the animation loop can read fresh values without
  // being re-created on every frame.
  const valueRef = useRef(0);
  const holdingRef = useRef(false);
  const completeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current != null) return;

    // `tick` is local so it can recurse without a self-referential useCallback.
    const tick = (time: number) => {
      const deltaMs = Math.min(time - lastTimeRef.current, 60);
      lastTimeRef.current = time;

      const step = deltaMs / durationMs;
      let next =
        valueRef.current + (holdingRef.current ? step : -step * RELEASE_MULTIPLIER);
      next = clamp(next, 0, 1);
      valueRef.current = next;
      setProgress(next);

      // Subtle haptic ticks as the hold crosses thirds.
      const milestone = Math.floor(next * 3);
      if (holdingRef.current && milestone > lastMilestoneRef.current) {
        lastMilestoneRef.current = milestone;
        haptic(5);
      } else if (!holdingRef.current) {
        lastMilestoneRef.current = milestone;
      }

      if (next >= 1 && !completeRef.current) {
        completeRef.current = true;
        holdingRef.current = false;
        setIsHolding(false);
        setIsComplete(true);
        haptic([14, 40, 22]);
        onCompleteRef.current();
      }

      const shouldContinue =
        !completeRef.current && (holdingRef.current || valueRef.current > 0);
      rafRef.current = shouldContinue ? requestAnimationFrame(tick) : null;
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (completeRef.current) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      holdingRef.current = true;
      setIsHolding(true);
      haptic(6);
      ensureLoop();
    },
    [ensureLoop],
  );

  const release = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setIsHolding(false);
    ensureLoop(); // keep the loop alive to drain progress smoothly
  }, [ensureLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    progress,
    isHolding,
    isComplete,
    handlers: {
      onPointerDown,
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    },
  };
}
