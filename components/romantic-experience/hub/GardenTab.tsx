"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PLANT_DURATION_MS, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { todayKey } from "@/lib/daily";
import { haptic } from "@/lib/utils";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { LilyBloom } from "../LilyBloom";
import { GardenScene } from "./GardenScene";
import { useKeepsakes, type GardenLily } from "./keepsake-context";
import { NoteOverlay } from "./ui/NoteOverlay";
import { TabScreen } from "./ui/TabScreen";

/** A sprig glyph for the plant button. */
function Sprout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21v-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M12 14c-1-3-4-4-6-4 0 3 2 5 6 5Zm0-1c1-3.4 4-4.6 6.5-4.6 0 3.2-2.4 5.2-6.5 5.2Z"
        fill="currentColor"
        opacity={0.9}
      />
    </svg>
  );
}

/** The garden: a scenic sky and a grassy bank the lilies grow from. */
export function GardenTab() {
  const { nickname, blooms, streak, plantLily } = useKeepsakes();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<GardenLily | null>(null);

  // The most recent bloom, if it opened today, gets the full grow-and-bloom.
  const today = todayKey();
  const freshId =
    blooms.length > 0 && blooms[blooms.length - 1].date === today
      ? blooms[blooms.length - 1].id
      : null;

  const { progress, isHolding, handlers } = useHoldProgress({
    durationMs: PLANT_DURATION_MS,
    onComplete: () => {
      haptic([10, 30]);
      plantLily();
    },
  });

  return (
    <TabScreen
      title={copy.hub.garden.title(nickname)}
      subtitle={copy.hub.garden.subtitle}
    >
      <div className="mb-5 flex items-center gap-2 text-sm text-ink-muted">
        <span className="rounded-full bg-surface px-3 py-1">
          {blooms.length} {blooms.length === 1 ? "lily" : "lilies"}
        </span>
        {streak > 1 && (
          <span className="rounded-full bg-rose/15 px-3 py-1 text-rose">
            {streak} days in a row
          </span>
        )}
      </div>

      <GardenScene
        blooms={blooms}
        freshId={freshId}
        emptyLine={copy.hub.garden.empty}
        onOpen={setSelected}
      />

      {/* plant control — hold and the soil fills */}
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          {...handlers}
          aria-label="Press and hold to plant a lily"
          className="relative flex h-14 w-48 touch-none items-center justify-center gap-2 overflow-hidden rounded-full border border-hairline-strong bg-surface text-sm font-medium text-ink-muted backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0"
            style={{
              height: `${progress * 100}%`,
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--color-leaf) 55%, transparent), color-mix(in srgb, var(--color-leaf) 20%, transparent))",
              transition: reduceMotion ? undefined : "height 0.09s linear",
            }}
          />
          <Sprout className="relative h-5 w-5 text-leaf" />
          <span className="relative">
            {isHolding ? copy.hub.garden.planting : copy.hub.garden.plant}
          </span>
        </button>
      </div>

      <NoteOverlay
        open={selected !== null}
        onClose={() => setSelected(null)}
        label="A lily's note"
      >
        {selected && (
          <div className="rounded-3xl border border-hairline bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
            <motion.div
              className="mx-auto mb-4 h-16 w-16"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_SOFT }}
            >
              <LilyBloom className="h-full w-full" />
            </motion.div>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-ink-faint">
              {selected.kind === "planted" ? "planted" : "bloomed"} · {selected.label}
            </p>
            <p className="font-display text-lg leading-relaxed text-ink">
              {selected.note}
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 text-xs text-ink-faint transition-colors hover:text-ink-muted"
            >
              close
            </button>
          </div>
        )}
      </NoteOverlay>
    </TabScreen>
  );
}
