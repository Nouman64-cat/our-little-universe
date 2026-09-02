"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PLANT_DURATION_MS, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { hashString, todayKey } from "@/lib/daily";
import { haptic } from "@/lib/utils";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { LilyBloom } from "../LilyBloom";
import { LilyIcon } from "../ui/LilyIcon";
import { useKeepsakes, type GardenLily } from "./keepsake-context";
import { NoteOverlay } from "./ui/NoteOverlay";
import { TabScreen } from "./ui/TabScreen";

/**
 * One flower on a stem. Stem height and flower size come from the bloom id so
 * the bed looks planted, not gridded. Only the flower that opened today gets
 * the full bloom animation; the rest are static (and cheap) `LilyIcon`s.
 */
function Flower({
  bloom,
  fresh,
  onOpen,
}: {
  bloom: GardenLily;
  fresh: boolean;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const stemHeight = 34 + (hashString(bloom.id) % 26);
  const size = 42 + (hashString(`${bloom.id}s`) % 16);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Lily from ${bloom.label}`}
      className="flex shrink-0 flex-col items-center rounded-xl px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
      initial={
        reduceMotion || !fresh ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.7 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: fresh ? 0.9 : 0.4, ease: EASE_SOFT }}
    >
      <span style={{ width: size, height: size }}>
        {fresh ? (
          <LilyBloom className="h-full w-full" />
        ) : (
          <LilyIcon className="h-full w-full" />
        )}
      </span>
      <span
        className="w-[3px] rounded-full"
        style={{
          height: stemHeight,
          background: "linear-gradient(to top, #5f8f72, var(--color-leaf))",
        }}
      />
    </motion.button>
  );
}

/** The garden: a lily per visit, tap to read its note, hold the soil for more. */
export function GardenTab() {
  const reduceMotion = useReducedMotion();
  const { nickname, blooms, streak, plantLily } = useKeepsakes();
  const [selected, setSelected] = useState<GardenLily | null>(null);

  // The most recent bloom, if it's from today, gets the full opening animation.
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
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
        <span className="rounded-full bg-white/8 px-3 py-1">
          {blooms.length} {blooms.length === 1 ? "lily" : "lilies"}
        </span>
        {streak > 1 && (
          <span className="rounded-full bg-rose/15 px-3 py-1 text-rose">
            {streak} days in a row
          </span>
        )}
      </div>

      <div className="relative flex-1 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-[#1a3326]/30 p-4">
        {blooms.length > 0 ? (
          <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-4">
            {blooms.map((bloom) => (
              <Flower
                key={bloom.id}
                bloom={bloom}
                fresh={bloom.id === freshId}
                onOpen={() => setSelected(bloom)}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-ink-faint">
            {copy.hub.garden.empty}
          </p>
        )}

        {/* soil / plant control */}
        <div className="mt-4 flex flex-col items-center border-t border-white/10 pt-4">
          <button
            type="button"
            {...handlers}
            aria-label="Press and hold to plant a lily"
            className="relative flex h-14 w-40 touch-none items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] text-sm font-medium text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          >
            <span
              className="absolute inset-y-0 left-0 bg-leaf/25"
              style={{ width: `${progress * 100}%`, transition: reduceMotion ? undefined : "width 0.08s linear" }}
            />
            <span className="relative">
              {isHolding ? copy.hub.garden.planting : copy.hub.garden.plant}
            </span>
          </button>
        </div>
      </div>

      <NoteOverlay
        open={selected !== null}
        onClose={() => setSelected(null)}
        label="A lily's note"
      >
        {selected && (
          <div className="rounded-3xl border border-white/12 bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
            <div className="mx-auto mb-4 h-16 w-16">
              <LilyBloom className="h-full w-full" />
            </div>
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
