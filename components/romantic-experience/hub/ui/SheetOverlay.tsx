"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

interface SheetOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessible label for the dialog. */
  label: string;
}

/**
 * A bottom-anchored sheet on a dim backdrop — the sibling of `NoteOverlay` for
 * moments that need a tray of choices rather than a single card. Closes on
 * backdrop tap or Escape; the scene stays visible above it.
 */
export function SheetOverlay({ open, onClose, children, label }: SheetOverlayProps) {
  const reduceMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
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
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-canvas/55 backdrop-blur-sm" />
          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            className="relative max-h-[64vh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] border border-hairline bg-canvas-raised px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 outline-none"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-hairline-strong" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
