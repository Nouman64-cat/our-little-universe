"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sample } from "@/lib/utils";
import type { WhisperPool } from "@/lib/whispers";

interface ResolvedWhispers {
  /** Intro line for the landing screen. */
  intro: string;
  /** Prompt shown during the catching game. */
  gameHint: string;
  /** The subset of drifting lines chosen for this run. */
  whispers: string[];
  /** Re-pick every line — called when the whole experience restarts. */
  reshuffle: () => void;
}

const WhisperContext = createContext<ResolvedWhispers | null>(null);

type Picks = Omit<ResolvedWhispers, "reshuffle">;

function pickAll(pool: WhisperPool): Picks {
  return {
    intro: sample(pool.intros, 1)[0] ?? pool.intros[0],
    gameHint: sample(pool.gameHints, 1)[0] ?? pool.gameHints[0],
    whispers: sample(pool.whispers, 6),
  };
}

/**
 * Holds the ambient copy for the current run, chosen randomly from the pool.
 *
 * The pick happens in a state initializer, so the server and client can land on
 * different lines. Only `intro` is in the server-rendered HTML (the game screens
 * mount later), and it carries `suppressHydrationWarning` where it's rendered —
 * a deliberately varying decorative line, exactly what that opt-out is for.
 */
export function WhisperProvider({
  pool,
  children,
}: {
  pool: WhisperPool;
  children: ReactNode;
}) {
  const [picks, setPicks] = useState<Picks>(() => pickAll(pool));

  const reshuffle = useCallback(() => setPicks(pickAll(pool)), [pool]);

  const value = useMemo<ResolvedWhispers>(
    () => ({ ...picks, reshuffle }),
    [picks, reshuffle],
  );

  return <WhisperContext.Provider value={value}>{children}</WhisperContext.Provider>;
}

export function useWhispers(): ResolvedWhispers {
  const context = useContext(WhisperContext);
  if (!context) {
    throw new Error("useWhispers must be used within a WhisperProvider");
  }
  return context;
}
