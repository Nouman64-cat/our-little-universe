"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { haptic } from "@/lib/utils";
import { HeartGame } from "../heart-game/HeartGame";
import { HeartGameResult } from "../HeartGameResult";
import { GlowButton } from "../ui/GlowButton";
import { HeartIcon } from "../ui/HeartIcon";
import { useKeepsakes } from "./keepsake-context";

type Phase = "intro" | "playing" | "result";

/** A centred column with the tab's standard padding (clears the bottom nav). */
function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-1 flex-col items-center justify-center px-6 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-[calc(env(safe-area-inset-top)+2.25rem)] text-center">
      {children}
    </div>
  );
}

/** The hub's replayable version of the catching game. */
export function GameTab() {
  const reduceMotion = useReducedMotion();
  const {
    gamePlays,
    gameHearts,
    recordGame,
    randomGameHint,
    randomGameWhispers,
    randomResultReveal,
  } = useKeepsakes();

  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(() => ({
    hint: randomGameHint(),
    whispers: randomGameWhispers(),
    reveal: randomResultReveal(),
  }));

  const startGame = useCallback(() => {
    setRound({
      hint: randomGameHint(),
      whispers: randomGameWhispers(),
      reveal: randomResultReveal(),
    });
    setScore(0);
    haptic(6);
    setPhase("playing");
  }, [randomGameHint, randomGameWhispers, randomResultReveal]);

  const handleComplete = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      recordGame(finalScore);
      setPhase("result");
    },
    [recordGame],
  );

  return (
    <motion.div
      // Follows the hub's theme. `isolate` + an opaque `bg-canvas` keep the
      // playfield on its own solid ground so the falling hearts read cleanly.
      className="isolate flex min-h-dvh w-full flex-col bg-canvas text-ink"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: EASE_SOFT }}
    >
      {/* Covers the viewport while the playfield scrolls under the hearts. */}
      <div aria-hidden className="fixed inset-0 -z-10 bg-canvas" />

      {phase === "intro" && (
        <Centered>
          <motion.div
            className="mb-7 h-14 w-14 text-rose"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_SOFT }}
            style={{ filter: "drop-shadow(0 0 20px rgba(255,158,196,0.55))" }}
          >
            <motion.div
              className="h-full w-full"
              animate={reduceMotion ? undefined : { scale: [1, 1.09, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartIcon className="h-full w-full" />
            </motion.div>
          </motion.div>

          <h1 className="font-display text-2xl font-medium text-ink">
            {copy.hub.game.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{copy.hub.game.subtitle}</p>

          <div className="mt-8">
            <GlowButton onClick={startGame} ariaLabel="Start the hearts game">
              {copy.hub.game.start}
            </GlowButton>
          </div>

          {gamePlays > 0 && (
            <p className="mt-5 text-xs text-ink-faint">
              {copy.hub.game.stats(gamePlays, gameHearts)}
            </p>
          )}
        </Centered>
      )}

      {phase === "playing" && (
        <div className="relative h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] w-full">
          <HeartGame
            embedded
            hint={round.hint}
            whispers={round.whispers}
            onComplete={handleComplete}
          />
        </div>
      )}

      {phase === "result" && (
        <Centered>
          <HeartGameResult
            score={score}
            reveal={round.reveal}
            ctaLabel={copy.hub.game.again}
            onContinue={startGame}
            footer={copy.hub.game.stats(gamePlays, gameHearts)}
          />
        </Centered>
      )}
    </motion.div>
  );
}
