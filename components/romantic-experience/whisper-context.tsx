"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { sample } from "@/lib/utils";
import type { SiteContent } from "@/lib/content";

interface JourneyCopy {
  /** Intro line for the landing screen. */
  intro: string;
  /** Prompt shown during the catching game. */
  gameHint: string;
  /** The subset of drifting lines chosen for this run. */
  whispers: string[];
  /** Teasing line under the score on the result screen. */
  resultReveal: string;
  /** The message hidden under the scratch card. */
  scratchMessage: string;
  /** The two closing lines. */
  finale: { line1: string; line2: string };
}

const WhisperContext = createContext<JourneyCopy | null>(null);

function splitFinale(entry: string): { line1: string; line2: string } {
  const [line1, line2 = ""] = entry.split("\n");
  return { line1: line1.trim(), line2: line2.trim() };
}

function pickJourneyCopy(content: SiteContent): JourneyCopy {
  return {
    intro: sample(content.intros, 1)[0] ?? content.intros[0],
    gameHint: sample(content.gameHints, 1)[0] ?? content.gameHints[0],
    whispers: sample(content.whispers, 6),
    resultReveal: sample(content.resultReveals, 1)[0] ?? content.resultReveals[0],
    scratchMessage:
      sample(content.scratchMessages, 1)[0] ?? content.scratchMessages[0],
    finale: splitFinale(sample(content.finales, 1)[0] ?? content.finales[0]),
  };
}

/**
 * Holds the ambient + varied copy for one run of the journey, chosen randomly
 * from the pool. The pick happens in a state initializer, so server and client
 * can land on different lines; the lines that reach the server HTML carry
 * `suppressHydrationWarning` where they're rendered. A fresh mount (e.g.
 * replaying from the hub) re-picks automatically.
 */
export function WhisperProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  const [copy] = useState<JourneyCopy>(() => pickJourneyCopy(content));
  return <WhisperContext.Provider value={copy}>{children}</WhisperContext.Provider>;
}

export function useWhispers(): JourneyCopy {
  const context = useContext(WhisperContext);
  if (!context) {
    throw new Error("useWhispers must be used within a WhisperProvider");
  }
  return context;
}
