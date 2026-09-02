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
}

const WhisperContext = createContext<JourneyCopy | null>(null);

function pickJourneyCopy(content: SiteContent): JourneyCopy {
  return {
    intro: sample(content.intros, 1)[0] ?? content.intros[0],
    gameHint: sample(content.gameHints, 1)[0] ?? content.gameHints[0],
    whispers: sample(content.whispers, 6),
  };
}

/**
 * Holds the ambient copy for one run of the journey, chosen randomly from the
 * pool. The pick happens in a state initializer, so server and client can land
 * on different lines; only `intro` reaches the server HTML and it carries
 * `suppressHydrationWarning` where it's rendered. A fresh mount (e.g. replaying
 * from the hub) re-picks automatically.
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
