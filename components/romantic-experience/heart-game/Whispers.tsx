"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface WhispersProps {
  /** Short lines to rotate through, one at a time. */
  lines: string[];
}

const ROTATE_MS = 3600;

/**
 * Faint half-thoughts that fade through the middle of the playfield while the
 * game runs. Decorative and low-contrast so they never compete with the
 * hearts; hidden entirely under reduced motion.
 */
export function Whispers({ lines }: WhispersProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || lines.length < 2) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, lines.length]);

  if (reduceMotion || lines.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center px-10">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-center font-display text-base italic text-rose/45"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          {lines[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
