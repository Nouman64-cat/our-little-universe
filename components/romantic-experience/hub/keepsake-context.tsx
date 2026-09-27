"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NICKNAME } from "@/lib/config";
import type { SiteContent } from "@/lib/content";
import {
  daysBetween,
  formatMonthDay,
  greetingPrefix,
  hashString,
  pickByKey,
  todayKey,
} from "@/lib/daily";
import type { Letter } from "@/lib/keepsakes";
import { composeLetter, handwrittenLetter, isLetter } from "@/lib/letters";
import type { FlowerSpecies } from "@/lib/flowers";
import { MAX_PLOTS } from "@/lib/garden-decor";
import {
  applyDailyVisit,
  loadState,
  saveState,
  type GardenBloom,
  type OluState,
} from "@/lib/storage";
import { pickOne, sample } from "@/lib/utils";

/** A garden flower with its note, species, human date and bed position resolved. */
export interface GardenLily extends GardenBloom {
  id: string;
  note: string;
  label: string;
  species: FlowerSpecies;
  /** Resolved bed position (`x` in plot units left→right, `y` 0–1 back→front). */
  x: number;
  y: number;
}

interface KeepsakeValue {
  nickname: string;

  /** "good morning" / "up late" … */
  timeGreeting: string;
  /** The softer second line under it. */
  greetingLine: string;
  /** Which day this is, counting from her first visit (>= 1). */
  daysKnown: number;

  sweetOfDay: string;
  sweetTaken: boolean;
  takeSweetOfDay: () => void;
  randomSweet: () => string;
  /** Candy slots taken from the jar since it was last full. */
  takenSweets: number[];
  /** Mark a candy slot as eaten. */
  takeSweet: (index: number) => void;
  /** Put every candy back. */
  refillJar: () => void;

  blooms: GardenLily[];
  streak: number;
  /**
   * Plant an extra flower of the given species, dated today, at the spot she
   * tapped in the bed (`x` in plot units left→right, `y` 0–1 back→front).
   */
  plantFlower: (species: FlowerSpecies, x: number, y: number) => void;

  hugsSent: number;
  sendHug: () => void;
  randomTeddyLine: () => string;

  /** Hearts game (hub). */
  gamePlays: number;
  gameHearts: number;
  recordGame: (score: number) => void;
  randomGameHint: () => string;
  randomGameWhispers: () => string[];
  randomResultReveal: () => string;

  /**
   * The next sealed letter, ready to read — `null` only while a new one is
   * still being fetched. The box never runs out: after the hand-written ones,
   * a fresh letter arrives every day.
   */
  nextLetter: Letter | null;
  /** True when a new letter can be opened today (one per day, none yet today). */
  letterWaiting: boolean;
  /** How many letters she has opened — they don't come back. */
  lettersReadCount: number;
  /** Open today's letter: consumes it and starts the one-per-day cooldown. */
  openTodaysLetter: () => void;
}

const KeepsakeContext = createContext<KeepsakeValue | null>(null);

/**
 * Owns the hub's device-persisted state (`localStorage`) and derives the
 * once-a-day content from it. The hub only ever mounts on the client (after
 * `RomanticExperience`'s client-side check), so the state initializer can read
 * `localStorage` directly and fold in today's visit — no hydration gap.
 */
export function KeepsakeProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  const today = todayKey();
  const [state, setState] = useState<OluState>(() =>
    applyDailyVisit(loadState(), today),
  );

  // Persist every change, including today's freshly added lily on first render.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const takeSweetOfDay = useCallback(() => {
    setState((current) =>
      current.openedSweetDays.includes(today)
        ? current
        : { ...current, openedSweetDays: [...current.openedSweetDays, today] },
    );
  }, [today]);

  const takeSweet = useCallback((index: number) => {
    setState((current) =>
      current.takenSweets.includes(index)
        ? current
        : { ...current, takenSweets: [...current.takenSweets, index] },
    );
  }, []);

  const refillJar = useCallback(() => {
    setState((current) =>
      current.takenSweets.length === 0
        ? current
        : { ...current, takenSweets: [] },
    );
  }, []);

  const plantFlower = useCallback(
    (species: FlowerSpecies, x: number, y: number) => {
      const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));
      setState((current) => ({
        ...current,
        gardenBlooms: [
          ...current.gardenBlooms,
          {
            date: today,
            kind: "planted",
            species,
            x: clamp(x, MAX_PLOTS),
            y: clamp(y, 1),
          },
        ],
      }));
    },
    [today],
  );

  const sendHug = useCallback(() => {
    setState((current) => ({ ...current, hugsSent: current.hugsSent + 1 }));
  }, []);

  // One sealed letter can be opened per calendar day; opening it consumes it.
  const openTodaysLetter = useCallback(() => {
    setState((current) => {
      if (current.lastLetterDate === today) return current;
      const next = firstUnread(current.readLetters);
      return {
        ...current,
        readLetters: [...current.readLetters, next],
        lastLetterDate: today,
      };
    });
  }, [today]);

  const randomSweet = useCallback(() => pickOne(content.sweets), [content.sweets]);
  const randomTeddyLine = useCallback(
    () => pickOne(content.teddyLines),
    [content.teddyLines],
  );

  const recordGame = useCallback((score: number) => {
    setState((current) => ({
      ...current,
      gamePlays: current.gamePlays + 1,
      gameHearts: current.gameHearts + score,
    }));
  }, []);

  const randomGameHint = useCallback(
    () => pickOne(content.gameHints),
    [content.gameHints],
  );
  const randomGameWhispers = useCallback(
    () => sample(content.whispers, 6),
    [content.whispers],
  );
  const randomResultReveal = useCallback(
    () => pickOne(content.resultReveals),
    [content.resultReveals],
  );

  const blooms = useMemo<GardenLily[]>(
    () =>
      state.gardenBlooms.map((bloom, index) => {
        const id = `${bloom.date}-${bloom.kind}-${index}`;
        // Blooms she placed carry their own spot; the rest scatter from their id.
        const x = bloom.x ?? (hashString(`${id}x`) % 1000) / 1000;
        const y = bloom.y ?? (hashString(`${id}y`) % 1000) / 1000;
        return {
          ...bloom,
          id,
          note: pickByKey(content.lilies, id),
          label: formatMonthDay(bloom.date),
          species: bloom.species ?? "lily",
          x,
          y,
        };
      }),
    [state.gardenBlooms, content.lilies],
  );

  const nextLetterIndex = useMemo(
    () => firstUnread(state.readLetters),
    [state.readLetters],
  );
  const letterWaiting = state.lastLetterDate !== today;

  // Past the hand-written letters, today's is fetched (written fresh on the
  // server) as soon as it's waiting, so it's ready by the time she opens it.
  const [fetchedLetter, setFetchedLetter] = useState<{
    n: number;
    letter: Letter;
  } | null>(null);
  const handwritten = handwrittenLetter(nextLetterIndex);
  const needsFetch =
    letterWaiting && !handwritten && fetchedLetter?.n !== nextLetterIndex;

  useEffect(() => {
    if (!needsFetch) return;
    const n = nextLetterIndex;
    const controller = new AbortController();
    fetch(`/api/letter?n=${n}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        setFetchedLetter({ n, letter: isLetter(data) ? data : composeLetter(n) });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFetchedLetter({ n, letter: composeLetter(n) });
        }
      });
    return () => controller.abort();
  }, [needsFetch, nextLetterIndex]);

  const nextLetter =
    handwritten ??
    (fetchedLetter?.n === nextLetterIndex ? fetchedLetter.letter : null);

  const value = useMemo<KeepsakeValue>(
    () => ({
      nickname: NICKNAME,
      timeGreeting: greetingPrefix(),
      greetingLine: pickByKey(content.greetings, today),
      daysKnown: state.firstVisit
        ? Math.max(1, daysBetween(state.firstVisit, today) + 1)
        : 1,
      sweetOfDay: pickByKey(content.sweets, today),
      sweetTaken: state.openedSweetDays.includes(today),
      takeSweetOfDay,
      randomSweet,
      takenSweets: state.takenSweets,
      takeSweet,
      refillJar,
      blooms,
      streak: state.streak,
      plantFlower,
      hugsSent: state.hugsSent,
      sendHug,
      randomTeddyLine,
      gamePlays: state.gamePlays,
      gameHearts: state.gameHearts,
      recordGame,
      randomGameHint,
      randomGameWhispers,
      randomResultReveal,
      nextLetter,
      letterWaiting,
      lettersReadCount: state.readLetters.length,
      openTodaysLetter,
    }),
    [
      content,
      today,
      state.firstVisit,
      state.openedSweetDays,
      state.streak,
      state.hugsSent,
      state.gamePlays,
      state.gameHearts,
      state.readLetters,
      state.takenSweets,
      takeSweet,
      refillJar,
      nextLetter,
      letterWaiting,
      openTodaysLetter,
      blooms,
      takeSweetOfDay,
      randomSweet,
      plantFlower,
      sendHug,
      randomTeddyLine,
      recordGame,
      randomGameHint,
      randomGameWhispers,
      randomResultReveal,
    ],
  );

  return (
    <KeepsakeContext.Provider value={value}>{children}</KeepsakeContext.Provider>
  );
}

/** The lowest letter number she hasn't opened yet. */
function firstUnread(read: number[]): number {
  let n = 0;
  while (read.includes(n)) n += 1;
  return n;
}

export function useKeepsakes(): KeepsakeValue {
  const context = useContext(KeepsakeContext);
  if (!context) {
    throw new Error("useKeepsakes must be used within a KeepsakeProvider");
  }
  return context;
}
