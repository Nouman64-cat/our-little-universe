"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

interface NoteOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessible label for the dialog. */
  label: string;
}

/**
 * A small centred card on a dimmed backdrop — used for opening a sweet or
 * reading a lily's note. Closes on backdrop tap or Escape; traps nothing
 * heavier than that since the content is a single readable moment.
 */
export function NoteOverlay({ open, onClose, children, label }: NoteOverlayProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-canvas/70 backdrop-blur-sm" />
          <motion.div
            ref={cardRef}
            tabIndex={-1}
            className="relative w-full max-w-xs outline-none"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
