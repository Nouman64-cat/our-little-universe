"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { todayKey } from "@/lib/daily";
import { haptic } from "@/lib/utils";
import { FLOWER_LABEL, FLOWER_SPECIES, type FlowerSpecies } from "@/lib/flowers";
import { FlowerArt } from "../flowers";
import { GardenScene } from "./GardenScene";
import { useKeepsakes, type GardenLily } from "./keepsake-context";
import { NoteOverlay } from "./ui/NoteOverlay";
import { TabScreen } from "./ui/TabScreen";

/** The garden: a scenic sky and a grassy bed she scatters flowers across by tapping. */
export function GardenTab() {
  const { nickname, blooms, streak, plantFlower } = useKeepsakes();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<GardenLily | null>(null);
  const [species, setSpecies] = useState<FlowerSpecies>("lily");

  // The most recent bloom, if it opened today, gets the full grow-and-bloom.
  const today = todayKey();
  const freshId =
    blooms.length > 0 && blooms[blooms.length - 1].date === today
      ? blooms[blooms.length - 1].id
      : null;

  const handlePlant = (x: number, y: number) => {
    haptic([10, 30]);
    plantFlower(species, x, y);
  };

  return (
    <TabScreen bare>
      <div className="relative min-h-dvh w-full overflow-hidden">
        <GardenScene
          blooms={blooms}
          freshId={freshId}
          emptyLine={copy.hub.garden.empty}
          plantLabel={copy.hub.garden.plant(FLOWER_LABEL[species])}
          onOpen={setSelected}
          onPlant={handlePlant}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/35 via-black/12 to-transparent" />

        {/* title + counts, floated over the sky */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.15 }}
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-center"
        >
          <h1 className="font-display text-2xl font-medium text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
            {copy.hub.garden.title(nickname)}
          </h1>
          <p className="mt-1 text-sm text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
            {copy.hub.garden.subtitle}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-white/90 backdrop-blur-sm">
              {blooms.length} {blooms.length === 1 ? "flower" : "flowers"}
            </span>
            {streak > 1 && (
              <span className="rounded-full border border-rose/40 bg-rose/25 px-3 py-1 text-white backdrop-blur-sm">
                {streak} days in a row
              </span>
            )}
          </div>
        </motion.div>

        {/* flower picker + a nudge to tap the bed */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SOFT, delay: 0.25 }}
          className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4rem)] flex flex-col items-center gap-2.5 px-6"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            {copy.hub.garden.pick}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            {FLOWER_SPECIES.map((s) => {
              const active = s === species;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    haptic(4);
                    setSpecies(s);
                  }}
                  aria-pressed={active}
                  aria-label={FLOWER_LABEL[s]}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
                    active
                      ? "scale-110 border-rose/70 bg-rose/25"
                      : "border-white/20 bg-black/30 hover:bg-black/45"
                  }`}
                >
                  <FlowerArt species={s} className="h-7 w-7" />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">
            {copy.hub.garden.tap(FLOWER_LABEL[species])}
          </p>
        </motion.div>
      </div>

      <NoteOverlay
        open={selected !== null}
        onClose={() => setSelected(null)}
        label="A flower's note"
      >
        {selected && (
          <div className="rounded-3xl border border-hairline bg-canvas-raised/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
            <motion.div
              className="mx-auto mb-4 h-16 w-16"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_SOFT }}
            >
              <FlowerArt species={selected.species} className="h-full w-full" />
            </motion.div>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-ink-faint">
              {selected.kind === "planted" ? "planted" : "bloomed"} ·{" "}
              {FLOWER_LABEL[selected.species]} · {selected.label}
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
