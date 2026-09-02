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

/** Return a new array with the elements of `items` in random order. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Take `count` random, distinct elements from `items`. */
export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, count);
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
