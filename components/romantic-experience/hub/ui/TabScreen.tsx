"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface TabScreenProps {
  children: ReactNode;
  /** Small heading shown at the top of the screen. */
  title?: string;
  /** Optional line under the title. */
  subtitle?: string;
}

/**
 * Shared shell for every hub tab: a scrollable, safe-area-aware column with a
 * gentle enter transition. `AnimatePresence` lives in `<Hub>`; each screen
 * needs a stable `key` there.
 */
export function TabScreen({ children, title, subtitle }: TabScreenProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="min-h-dvh w-full"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-[calc(env(safe-area-inset-top)+2.25rem)] pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        {title && (
          <header className="mb-6 shrink-0">
            <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </motion.div>
  );
}
