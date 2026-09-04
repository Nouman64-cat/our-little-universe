"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useNow } from "@/hooks/useNow";
import { EASE_SOFT } from "@/lib/motion";
import { formatCompactDuration, getAnniversaryState, getPakistanNow } from "@/lib/anniversary";
import { HeartIcon } from "../ui/HeartIcon";

/**
 * A small floating pill on the Home screen linking to the full `/anniversary`
 * countdown — otherwise that page has no entry point anywhere in the app.
 * Ticks live; swaps to a celebratory line on the monthiversary itself.
 */
export function MonthiversaryBadge() {
  const reduceMotion = useReducedMotion();
  const now = useNow();

  if (now === null) return null;

  const pk = getPakistanNow(new Date(now));
  const state = getAnniversaryState(pk);
  const label = state.isAnniversaryToday
    ? `${state.todayMonthCount} months, today ♡`
    : `monthiversary in ${formatCompactDuration(state.targetEpoch - now)}`;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.45 }}
      className="pointer-events-auto mt-3 flex justify-center"
    >
      <Link
        href="/anniversary"
        className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]"
      >
        <HeartIcon className="h-3.5 w-3.5 shrink-0" />
        <span suppressHydrationWarning>{label}</span>
      </Link>
    </motion.div>
  );
}
