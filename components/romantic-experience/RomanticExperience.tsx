"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { STAGE_CHAPTER } from "@/lib/config";
import type { WhisperPool } from "@/lib/whispers";
import type { ExperienceStage } from "@/types/experience";
import { AmbientBackground } from "./AmbientBackground";
import { FinalMessage } from "./FinalMessage";
import { HeartGame } from "./heart-game/HeartGame";
import { HeartGameResult } from "./HeartGameResult";
import { HoldToUnlock } from "./HoldToUnlock";
import { Landing } from "./Landing";
import { ProgressIndicator } from "./ProgressIndicator";
import { ScratchReveal } from "./ScratchReveal";
import { Stage } from "./ui/Stage";
import { WhisperProvider, useWhispers } from "./whisper-context";

/**
 * Orchestrates the whole journey: a single client component holding the current
 * stage and the mini-game score, swapping screens with a cinematic transition.
 * No routing, no reloads — just state.
 */
export function RomanticExperience({ whisperPool }: { whisperPool: WhisperPool }) {
  return (
    <WhisperProvider pool={whisperPool}>
      <ExperienceFlow />
    </WhisperProvider>
  );
}

function ExperienceFlow() {
  const { reshuffle } = useWhispers();
  const [stage, setStage] = useState<ExperienceStage>("landing");
  const [score, setScore] = useState(0);

  const goTo = useCallback((next: ExperienceStage) => setStage(next), []);

  const finishGame = useCallback((finalScore: number) => {
    setScore(finalScore);
    setStage("result");
  }, []);

  const restart = useCallback(() => {
    setScore(0);
    setStage("landing");
    reshuffle();
  }, [reshuffle]);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden">
      <AmbientBackground />

      {stage !== "landing" && (
        <ProgressIndicator
          chapter={STAGE_CHAPTER[stage]}
          allComplete={stage === "final"}
        />
      )}

      <AnimatePresence mode="wait">
        {stage === "landing" && (
          <Stage key="landing">
            <Landing onStart={() => goTo("game")} />
          </Stage>
        )}

        {stage === "game" && (
          <Stage key="game" bare>
            <HeartGame onComplete={finishGame} />
          </Stage>
        )}

        {stage === "result" && (
          <Stage key="result">
            <HeartGameResult score={score} onContinue={() => goTo("scratch")} />
          </Stage>
        )}

        {stage === "scratch" && (
          <Stage key="scratch">
            <ScratchReveal onContinue={() => goTo("hold")} />
          </Stage>
        )}

        {stage === "hold" && (
          <Stage key="hold">
            <HoldToUnlock onComplete={() => goTo("final")} />
          </Stage>
        )}

        {stage === "final" && (
          <Stage key="final">
            <FinalMessage onRestart={restart} />
          </Stage>
        )}
      </AnimatePresence>
    </main>
  );
}
