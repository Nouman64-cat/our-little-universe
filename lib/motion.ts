import type { Variants } from "motion/react";

/** Gentle ease-out curve used for most entrances. */
export const EASE_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Cinematic stage transition: rise + de-blur on enter, sink + blur on exit. */
export const stageVariants: Variants = {
  initial: { opacity: 0, y: 28, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_SOFT },
  },
  exit: {
    opacity: 0,
    y: -22,
    filter: "blur(10px)",
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

/** Reduced-motion equivalent: a plain crossfade, no movement or blur. */
export const stageVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Staggered "line by line" reveal for romantic statements. `custom` = index. */
export const lineVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SOFT, delay: 0.15 + i * 0.9 },
  }),
};
