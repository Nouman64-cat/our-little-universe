"use client";

import { useSyncExternalStore } from "react";

/**
 * A single shared ticking clock behind every `useNow()` call. `getSnapshot`
 * must return a *stable* value between ticks — calling `Date.now()` fresh on
 * every render makes `useSyncExternalStore` see a "changed" value on its
 * post-render consistency check nearly every time, which loops forever
 * (React error #185, "maximum update depth exceeded"). So the timestamp is
 * cached at module scope and only advances once a second, on the interval
 * tick shared by every subscriber.
 */
let cachedNow = Date.now();
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (intervalId === null) {
    intervalId = setInterval(() => {
      cachedNow = Date.now();
      listeners.forEach((listener) => listener());
    }, 1000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): number {
  return cachedNow;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * The current epoch ms, ticking once a second on the client. `null` until
 * hydration (matches a deterministic server render, per this codebase's
 * `useSyncExternalStore` convention — see `RomanticExperience.tsx`; a plain
 * `useEffect` + `setState(Date.now())` on mount trips the
 * `react-hooks/set-state-in-effect` lint rule).
 */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(subscribe, getSnapshot, getServerSnapshot);
}
