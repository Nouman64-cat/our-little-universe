"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { stageVariants, stageVariantsReduced } from "@/lib/motion";

interface StageProps {
  children: ReactNode;
  /** Remove the default centred column padding for full-bleed screens (the game). */
  bare?: boolean;
}

/**
 * Wraps each screen in the shared cinematic enter/exit transition and a
 * consistent, safe-area-aware full-height layout. `AnimatePresence` lives in
 * the parent; every `<Stage>` needs a stable `key`.
 */
export function Stage({ children, bare = false }: StageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={reduceMotion ? stageVariantsReduced : stageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={[
        "relative z-10 flex min-h-[100dvh] w-full flex-col items-center",
        bare
          ? "justify-start"
          : "justify-center gap-8 px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+5.5rem)]",
      ].join(" ")}
    >
      {children}
    </motion.section>
  );
}
