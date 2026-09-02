"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SiteContent } from "@/lib/content";
import { loadState, saveState } from "@/lib/storage";
import type { ExperienceMode } from "@/types/experience";
import { AmbientBackground } from "./AmbientBackground";
import { Journey } from "./Journey";
import { HeartIcon } from "./ui/HeartIcon";
import { WhisperProvider } from "./whisper-context";
import { Hub } from "./hub/Hub";
import { KeepsakeProvider } from "./hub/keepsake-context";

/** No external notifications — the value only changes via our own actions below. */
const noopSubscribe = () => () => {};

/**
 * Top level. Reads (once, on the client via `useSyncExternalStore`) whether the
 * journey has already been completed, and shows the hub or the first-run
 * journey accordingly. Until that client read resolves, only the ambient
 * background and a soft pulse are shown, so the wait reads as the scene coming
 * into focus rather than a blank load.
 */
export function RomanticExperience({ content }: { content: SiteContent }) {
  const persisted = useSyncExternalStore<ExperienceMode | null>(
    noopSubscribe,
    () => (loadState().journeyComplete ? "hub" : "journey"),
    () => null,
  );

  const [override, setOverride] = useState<ExperienceMode | null>(null);
  const mode = override ?? persisted;

  const enterHub = useCallback(() => {
    saveState({ ...loadState(), journeyComplete: true });
    setOverride("hub");
  }, []);

  const replayJourney = useCallback(() => setOverride("journey"), []);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden">
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {mode === null && (
          <motion.div
            key="veil"
            className="relative z-10 flex min-h-dvh items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="h-9 w-9 text-rose"
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 16px rgba(255,158,196,0.6))" }}
            >
              <HeartIcon className="h-full w-full" />
            </motion.span>
          </motion.div>
        )}

        {mode === "journey" && (
          <motion.div
            key="journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <WhisperProvider content={content}>
              <Journey onFinish={enterHub} />
            </WhisperProvider>
          </motion.div>
        )}

        {mode === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <KeepsakeProvider content={content}>
              <Hub onReplayJourney={replayJourney} />
            </KeepsakeProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
