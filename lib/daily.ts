/** Local-time date key, e.g. "2026-09-02". Used to gate once-a-day content. */
export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days from date key `a` to date key `b` (negative if `b` is earlier). */
export function daysBetween(a: string, b: string): number {
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** "September 2" — a soft, human date for notes and letters. */
export function formatMonthDay(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

/** Deterministic 32-bit hash (FNV-1a) so a given key always maps the same way. */
export function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** Stable pick from a list for a given key (a date, a bloom id, …). */
export function pickByKey<T>(items: readonly T[], key: string): T {
  return items[hashString(key) % items.length];
}

/** Time-of-day greeting prefix. */
export function greetingPrefix(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "up late";
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  if (hour < 22) return "good evening";
  return "up late";
}
