"use client";

import { useSyncExternalStore } from "react";

/** Ticks a listener once a second — the external store behind `useNow`. */
function subscribeToClock(callback: () => void): () => void {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

/**
 * The current epoch ms, ticking once a second on the client. `null` until
 * hydration (matches a deterministic server render, per this codebase's
 * `useSyncExternalStore` convention — see `RomanticExperience.tsx`; a plain
 * `useEffect` + `setState(Date.now())` on mount trips the
 * `react-hooks/set-state-in-effect` lint rule).
 */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(
    subscribeToClock,
    () => Date.now(),
    () => null,
  );
}
