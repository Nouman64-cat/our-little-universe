/**
 * Shared types + the hand-written fallback for the AI-varied ambient copy.
 * This module is client-safe — it never touches the API key. The generation
 * itself lives in `whispers.server.ts`.
 *
 * Only *ambient* lines are varied. The three anchor messages
 * ("I'd choose you in every lifetime.", "Still choosing you.", and
 * "Today. Tomorrow. Every version of us.") are fixed in `config.ts`.
 */
export interface WhisperPool {
  /** One-line intros for the opening screen. */
  intros: string[];
  /** 2–4 word prompts shown during the catching game. */
  gameHints: string[];
  /** Half-finished loving thoughts that drift past during the game. */
  whispers: string[];
}

export const FALLBACK_POOL: WhisperPool = {
  intros: [
    "First, I need you to catch something…",
    "Before anything else — hold out your hands.",
    "Something's falling. Keep as much as you can.",
    "There's a little game first. Humor me.",
    "Start here. I'll explain in a moment.",
    "Catch a few of these for me first.",
  ],
  gameHints: [
    "Tap the hearts",
    "Catch what falls",
    "Reach for them",
    "Gather a few",
    "Keep them close",
  ],
  whispers: [
    "you're my favorite hello",
    "still choosing this",
    "you make rooms warmer",
    "like lilies after rain",
    "my calmest thought",
    "home, but a person",
    "you, always you",
    "the good kind of quiet",
    "i'd do it all again",
    "soft morning, your voice",
    "every version of us",
    "you feel like spring",
    "the best part of today",
    "lucky, and knowing it",
    "your hand, then everything else",
    "petals open slower than this",
  ],
};
