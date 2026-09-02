import { daysBetween, todayKey } from "./daily";

/** One garden lily — either the automatic daily bloom or one she planted. */
export interface GardenBloom {
  date: string;
  kind: "daily" | "planted";
}

/**
 * Everything the site remembers on her device. Deliberately small and
 * forgiving: a corrupt or absent value just resets to the defaults.
 */
export interface OluState {
  journeyComplete: boolean;
  firstVisit: string | null;
  lastVisit: string | null;
  streak: number;
  gardenBlooms: GardenBloom[];
  openedSweetDays: string[];
  hugsSent: number;
  /** Times she's played the hearts game from the hub. */
  gamePlays: number;
  /** Running total of hearts caught in the hub game. */
  gameHearts: number;
  /** Indices (into `LETTERS`) of the love letters she has opened. */
  readLetters: number[];
}

export const DEFAULT_STATE: OluState = {
  journeyComplete: false,
  firstVisit: null,
  lastVisit: null,
  streak: 0,
  gardenBlooms: [],
  openedSweetDays: [],
  hugsSent: 0,
  gamePlays: 0,
  gameHearts: 0,
  readLetters: [],
};

const STORAGE_KEY = "olu:v1";

export function loadState(): OluState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<OluState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      gardenBlooms: Array.isArray(parsed.gardenBlooms) ? parsed.gardenBlooms : [],
      openedSweetDays: Array.isArray(parsed.openedSweetDays)
        ? parsed.openedSweetDays
        : [],
      readLetters: Array.isArray(parsed.readLetters)
        ? parsed.readLetters.filter((n): n is number => typeof n === "number")
        : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: OluState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — the experience still works, it just won't persist.
  }
}

/**
 * Fold "a new day has started" into the state: bump or reset the streak and
 * add today's lily. A no-op if she has already visited today.
 */
export function applyDailyVisit(state: OluState, today = todayKey()): OluState {
  if (state.lastVisit === today) return state;

  const consecutive =
    state.lastVisit != null && daysBetween(state.lastVisit, today) === 1;

  return {
    ...state,
    firstVisit: state.firstVisit ?? today,
    lastVisit: today,
    streak: consecutive ? state.streak + 1 : 1,
    gardenBlooms: [...state.gardenBlooms, { date: today, kind: "daily" }],
  };
}
