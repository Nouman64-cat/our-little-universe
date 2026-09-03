"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { STAGE_CHAPTER } from "@/lib/config";
import type { ExperienceStage } from "@/types/experience";
import { FinalMessage } from "./FinalMessage";
import { HeartGame } from "./heart-game/HeartGame";
import { HeartGameResult } from "./HeartGameResult";
import { HoldToUnlock } from "./HoldToUnlock";
import { Landing } from "./Landing";
import { ProgressIndicator } from "./ProgressIndicator";
import { ScratchReveal } from "./ScratchReveal";
import { Stage } from "./ui/Stage";
import { useWhispers } from "./whisper-context";

interface JourneyProps {
  /** Called from the final screen — hands off to the hub. */
  onFinish: () => void;
}

/**
 * The first-run journey: a six-screen state machine with cinematic
 * transitions. No routing — just state and `AnimatePresence`.
 */
export function Journey({ onFinish }: JourneyProps) {
  const { gameHint, whispers, resultReveal } = useWhispers();
  const [stage, setStage] = useState<ExperienceStage>("landing");
  const [score, setScore] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const goTo = useCallback((next: ExperienceStage) => setStage(next), []);

  const finishGame = useCallback((finalScore: number, runBestCombo: number) => {
    setScore(finalScore);
    setBestCombo(runBestCombo);
    setStage("result");
  }, []);

  return (
    <>
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
            <HeartGame
              hint={gameHint}
              whispers={whispers}
              onComplete={finishGame}
            />
          </Stage>
        )}

        {stage === "result" && (
          <Stage key="result">
            <HeartGameResult
              score={score}
              reveal={resultReveal}
              bestCombo={bestCombo}
              onContinue={() => goTo("scratch")}
            />
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
            <FinalMessage onEnterHub={onFinish} />
          </Stage>
        )}
      </AnimatePresence>
    </>
  );
}
