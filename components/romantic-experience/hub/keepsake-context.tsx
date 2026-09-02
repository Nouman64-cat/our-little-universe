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
import { LETTERS, MOMENTS, type Letter, type Moment } from "@/lib/keepsakes";
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
  /** Which letter to surface first: the earliest unopened, or the day's pick. */
  letterOfDayIndex: number;
  /** Indices of the letters she has opened. */
  readLetters: number[];
  /** First letter index she hasn't opened yet, or `null` once all are read. */
  firstUnreadLetter: number | null;
  /** How many distinct letters she has opened. */
  lettersReadCount: number;
  markLetterRead: (index: number) => void;
  moments: Moment[];
  /** A moment to show on arrival, reshuffled each visit to this provider. */
  momentOfVisit: number;
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

  const plantLily = useCallback(() => {
    setState((current) => ({
      ...current,
      gardenBlooms: [...current.gardenBlooms, { date: today, kind: "planted" }],
    }));
  }, [today]);

  const sendHug = useCallback(() => {
    setState((current) => ({ ...current, hugsSent: current.hugsSent + 1 }));
  }, []);

  const markLetterRead = useCallback((index: number) => {
    setState((current) =>
      current.readLetters.includes(index)
        ? current
        : { ...current, readLetters: [...current.readLetters, index] },
    );
  }, []);

  // One moment to greet her with, chosen once per mount of the hub.
  const [momentOfVisit] = useState(() =>
    Math.floor(Math.random() * Math.max(1, MOMENTS.length)),
  );

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

  const firstUnreadLetter = useMemo(() => {
    for (let i = 0; i < LETTERS.length; i += 1) {
      if (!state.readLetters.includes(i)) return i;
    }
    return null;
  }, [state.readLetters]);

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
      letterOfDayIndex: hashString(today) % LETTERS.length,
      readLetters: state.readLetters,
      firstUnreadLetter,
      lettersReadCount: state.readLetters.length,
      markLetterRead,
      moments: MOMENTS,
      momentOfVisit,
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
      firstUnreadLetter,
      markLetterRead,
      momentOfVisit,
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
