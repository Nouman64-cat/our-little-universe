/**
 * The "star jar": short notes chuchu writes, folds into paper stars, and drops
 * into a glass jar that fills up over time. Unlike the rest of the hub (device
 * `localStorage`), stars live in Supabase so they truly accumulate — see
 * `lib/supabase.ts` and `app/api/stars`.
 */

/** The paper a star is folded from. Maps to a palette token in the UI. */
export type StarColor = "petal" | "blush" | "lavender" | "honey" | "rose";

export const STAR_COLORS: readonly StarColor[] = [
  "petal",
  "blush",
  "lavender",
  "honey",
  "rose",
] as const;

/** Longest a single strip of paper can hold. */
export const STAR_MAX_LENGTH = 280;

/** One folded star, as stored and as sent to the client. */
export interface Star {
  id: string;
  text: string;
  color: StarColor;
  createdAt: string;
  updatedAt: string;
}

/** The shape a row comes back as from Supabase (snake_case columns). */
export interface StarRow {
  id: string;
  text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function rowToStar(row: StarRow): Star {
  return {
    id: row.id,
    text: row.text,
    color: isStarColor(row.color) ? row.color : "petal",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isStarColor(value: unknown): value is StarColor {
  return typeof value === "string" && STAR_COLORS.includes(value as StarColor);
}

/**
 * Trim and bound a strip of writing. Returns `null` when there's nothing usable
 * left — the caller should reject the request rather than store an empty star.
 */
export function sanitizeStarText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+\n/g, "\n");
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, STAR_MAX_LENGTH);
}

/** The CSS colour a star's paper is drawn in. */
export const STAR_PAPER: Record<StarColor, string> = {
  petal: "var(--color-petal)",
  blush: "var(--color-blush)",
  lavender: "var(--color-lavender)",
  honey: "var(--color-honey)",
  rose: "var(--color-rose)",
};

/** Human name for each paper, for the colour picker's labels. */
export const STAR_COLOR_LABEL: Record<StarColor, string> = {
  petal: "petal pink",
  blush: "blush",
  lavender: "lavender",
  honey: "honey",
  rose: "rose",
};
