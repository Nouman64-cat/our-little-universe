/** Random float in the `[min, max)` range. */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Clamp `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Pick a random element from a non-empty array. */
export function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Collision-resistant id for short-lived client-only entities (hearts, particles). */
export function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Trigger a very subtle haptic tap where supported. Silently ignored on
 * unsupported devices and when the user has motion reduced.
 */
export function haptic(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if called outside a user gesture — not important here.
  }
}
