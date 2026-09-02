import type { Chapter, ExperienceStage } from "@/types/experience";

/** What he calls her — woven lightly into the hub, not stamped everywhere. */
export const NICKNAME = "chuchu";

/** Length of the "Catch the Hearts" mini-game. */
export const GAME_DURATION_MS = 15_000;

/** How often a new heart is released while the game is running. */
export const HEART_SPAWN_INTERVAL_MS = 470;

/** Fraction of the scratch layer that must be removed before the card is "revealed". */
export const SCRATCH_REVEAL_THRESHOLD = 0.55;

/** How long the heart must be held continuously to unlock the final message. */
export const HOLD_DURATION_MS = 3_000;

/** How long to hold the soil to plant an extra lily in the garden. */
export const PLANT_DURATION_MS = 1_800;

/**
 * Maps a stage to the chapter (0–2) it belongs to. Used by the progress
 * indicator so the journey reads as three moments rather than six screens.
 */
export const STAGE_CHAPTER: Record<ExperienceStage, Chapter> = {
  landing: 0,
  game: 0,
  result: 0,
  scratch: 1,
  hold: 2,
  final: 2,
};

/** All user-facing copy, kept in one place so the tone stays consistent. */
export const copy = {
  landing: {
    kicker: "for you",
    title: "I made you something.",
    // The intro line under the title is AI-varied — see `lib/content.ts`.
    cta: "Start ♡",
  },
  result: {
    score: (n: number) => `You collected ${n} ${n === 1 ? "heart" : "hearts"}.`,
    reveal: "Unfortunately, I already gave you all of mine. ♡",
    cta: "Keep going →",
  },
  scratch: {
    title: "There's something under here…",
    surface: "Scratch me ♡",
    message: "I'd choose you in every lifetime. ♡",
    fallback: "Reveal it",
    cta: "One more thing…",
  },
  hold: {
    title: "Hold this for 3 seconds.",
    holding: "Keep holding…",
    released: "Hold the heart",
  },
  final: {
    line1: "Still choosing you.",
    line2: "Today. Tomorrow. Every version of us.",
    // Shown once the hub is unlocked, in place of "start again".
    enterHub: "Step inside ♡",
  },
  hub: {
    nav: {
      home: "Home",
      sweets: "Sweets",
      garden: "Garden",
      teddy: "Teddy",
      us: "Us",
    },
    home: {
      replay: "revisit the journey",
    },
    sweets: {
      title: "The sweet jar",
      subtitle: "one a day is yours. the rest, whenever.",
      ofTheDay: "today's sweet",
      taken: "you've had today's — help yourself to more",
      another: "have another",
      close: "close the jar",
    },
    garden: {
      title: (name: string) => `${name}'s garden`,
      subtitle: "a lily for every day you visit",
      plant: "plant one",
      planting: "hold…",
      empty: "come back tomorrow and watch it fill in",
    },
    teddy: {
      title: "someone waited up",
      hug: "send a hug",
      hugged: (n: number) => `${n} ${n === 1 ? "hug" : "hugs"} sent`,
    },
    us: {
      title: "Us",
      letterLabel: "a letter for today",
      momentsTitle: "our moments",
      momentsHint: "tap a star",
    },
  },
} as const;
