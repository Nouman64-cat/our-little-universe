"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /** Accessible label when the visible text alone isn't descriptive enough. */
  ariaLabel?: string;
  variant?: "solid" | "ghost";
  autoFocus?: boolean;
}

/**
 * The one button style in the experience: a rounded glass pill with a soft
 * rose glow, generous touch target, and a quiet press animation.
 */
export function GlowButton({
  children,
  onClick,
  ariaLabel,
  variant = "solid",
  autoFocus = false,
}: GlowButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative inline-flex">
      {variant === "solid" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-full bg-rose/25 blur-xl"
        />
      )}
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className={[
          "relative min-h-[52px] rounded-full px-8 py-3.5 text-base font-medium tracking-wide",
          "backdrop-blur-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          variant === "solid"
            ? "bg-rose/15 text-ink border border-rose/40 shadow-[0_0_30px_-8px_rgba(255,158,196,0.6)] hover:bg-rose/25"
            : "bg-white/5 text-ink-muted border border-white/10 hover:bg-white/10 hover:text-ink",
        ].join(" ")}
      >
        {children}
      </motion.button>
    </div>
  );
}
