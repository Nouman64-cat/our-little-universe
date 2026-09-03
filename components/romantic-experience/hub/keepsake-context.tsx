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
  pickByKey,
  todayKey,
} from "@/lib/daily";
import { LETTERS, type Letter } from "@/lib/keepsakes";
import {
  applyDailyVisit,
  loadState,
  saveState,
  type GardenBloom,
  type OluState,
} from "@/lib/storage";
import { pickOne, sample } from "@/lib/utils";

/** A garden lily with its note and a human date resolved. */
export interface GardenLily extends GardenBloom {
  id: string;
  note: string;
  label: string;
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
  plantLily: () => void;

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

  letters: Letter[];
  /** Total letters Cheeku has written. */
  lettersTotal: number;
  /** The next sealed letter in order, or `null` once every one is opened. */
  nextLetterIndex: number | null;
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

  const plantLily = useCallback(() => {
    setState((current) => ({
      ...current,
      gardenBlooms: [...current.gardenBlooms, { date: today, kind: "planted" }],
    }));
  }, [today]);

  const sendHug = useCallback(() => {
    setState((current) => ({ ...current, hugsSent: current.hugsSent + 1 }));
  }, []);

  // One sealed letter can be opened per calendar day; opening it consumes it.
  const openTodaysLetter = useCallback(() => {
    setState((current) => {
      if (current.lastLetterDate === today) return current;
      let next = -1;
      for (let i = 0; i < LETTERS.length; i += 1) {
        if (!current.readLetters.includes(i)) {
          next = i;
          break;
        }
      }
      if (next === -1) return current;
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
        return {
          ...bloom,
          id,
          note: pickByKey(content.lilies, id),
          label: formatMonthDay(bloom.date),
        };
      }),
    [state.gardenBlooms, content.lilies],
  );

  const nextLetterIndex = useMemo(() => {
    for (let i = 0; i < LETTERS.length; i += 1) {
      if (!state.readLetters.includes(i)) return i;
    }
    return null;
  }, [state.readLetters]);

  const letterWaiting =
    nextLetterIndex !== null && state.lastLetterDate !== today;

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
      plantLily,
      hugsSent: state.hugsSent,
      sendHug,
      randomTeddyLine,
      gamePlays: state.gamePlays,
      gameHearts: state.gameHearts,
      recordGame,
      randomGameHint,
      randomGameWhispers,
      randomResultReveal,
      letters: LETTERS,
      lettersTotal: LETTERS.length,
      nextLetterIndex,
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
      nextLetterIndex,
      letterWaiting,
      openTodaysLetter,
      blooms,
      takeSweetOfDay,
      randomSweet,
      plantLily,
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

export function useKeepsakes(): KeepsakeValue {
  const context = useContext(KeepsakeContext);
  if (!context) {
    throw new Error("useKeepsakes must be used within a KeepsakeProvider");
  }
  return context;
}
