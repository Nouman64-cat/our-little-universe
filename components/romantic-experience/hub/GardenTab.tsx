"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PLANT_DURATION_MS, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { todayKey } from "@/lib/daily";
import { haptic } from "@/lib/utils";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { FLOWER_LABEL, FLOWER_SPECIES, type FlowerSpecies } from "@/lib/flowers";
import type { GardenPart } from "@/lib/garden-decor";
import { FlowerArt } from "../flowers";
import { GardenScene } from "./GardenScene";
import { GardenEditor } from "./GardenEditor";
import { useGardenDecor } from "./garden-context";
import { useKeepsakes, type GardenLily } from "./keepsake-context";
import { NoteOverlay } from "./ui/NoteOverlay";
import { SheetOverlay } from "./ui/SheetOverlay";
import { TabScreen } from "./ui/TabScreen";

const g = copy.hub.garden;
const PARTS: GardenPart[] = ["fence", "gate", "path"];

/** The garden: a scenic sky, a grassy bed she plants by tapping, and a fence,
 *  gate and path she styles in "decorate" mode. */
export function GardenTab() {
  const { nickname, blooms, streak, plantFlower } = useKeepsakes();
  const { decor, resetDecor } = useGardenDecor();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<GardenLily | null>(null);
  const [species, setSpecies] = useState<FlowerSpecies>("lily");
  const [editing, setEditing] = useState(false);
  const [part, setPart] = useState<GardenPart | null>(null);

  // The most recent bloom, if it opened today, gets the full grow-and-bloom.
  const today = todayKey();
  const freshId =
    blooms.length > 0 && blooms[blooms.length - 1].date === today
      ? blooms[blooms.length - 1].id
      : null;

  const handlePlant = (x: number, y: number) => {
    if (editing) return; // taps restyle, not plant, while decorating
    haptic([10, 30]);
    plantFlower(species, x, y);
  };

  const toggleEditing = useCallback(() => {
    haptic(6);
    setEditing((e) => !e);
    setPart(null);
  }, []);

  return (
    <TabScreen bare>
      <div className="relative min-h-dvh w-full overflow-hidden">
        <GardenScene
          blooms={blooms}
          freshId={freshId}
          emptyLine={g.empty}
          plantLabel={g.plant(FLOWER_LABEL[species])}
          decor={decor}
          onOpen={setSelected}
          onPlant={handlePlant}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/35 via-black/12 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* title + counts, floated over the sky */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.15 }}
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-center"
        >
          <h1 className="font-display text-2xl font-medium text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
            {g.title(nickname)}
          </h1>
          <p className="mt-1 text-sm text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
            {g.subtitle}
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

        {/* bottom cluster — plant controls, or the decorate tray */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SOFT, delay: 0.25 }}
          className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] flex flex-col items-center gap-2 px-6"
        >
          <button
            type="button"
            onClick={toggleEditing}
            aria-pressed={editing}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md transition ${
              editing
                ? "border-rose/60 bg-rose/25 text-white"
                : "border-white/20 bg-black/30 text-white/80 hover:text-white"
            }`}
          >
            {editing ? g.done : g.decorate}
          </button>

          {editing ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                {g.styleHint}
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {PARTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      haptic(4);
                      setPart(p);
                    }}
                    aria-pressed={part === p}
                    className={`rounded-full border px-4 py-2 text-sm font-medium capitalize backdrop-blur-md transition ${
                      part === p
                        ? "border-rose/70 bg-rose/25 text-white"
                        : "border-white/20 bg-black/35 text-white/85 hover:bg-black/50"
                    }`}
                  >
                    {g[p]}
                  </button>
                ))}
              </div>
              <ResetButton onReset={resetDecor} />
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                {g.pick}
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
                {g.tap(FLOWER_LABEL[species])}
              </p>
            </>
          )}
        </motion.div>
      </div>

      <SheetOverlay
        open={editing && part !== null}
        onClose={() => setPart(null)}
        label="Restyle the garden"
      >
        {part && <GardenEditor part={part} decor={decor} />}
      </SheetOverlay>

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

/** Press-and-hold to put the fence, gate and path back to the starter set. */
function ResetButton({ onReset }: { onReset: () => void }) {
  const { progress, isHolding, handlers } = useHoldProgress({
    durationMs: PLANT_DURATION_MS,
    onComplete: () => {
      haptic([10, 30]);
      onReset();
    },
  });

  return (
    <button
      type="button"
      {...handlers}
      className="relative touch-none overflow-hidden rounded-full border border-white/25 bg-black/30 px-4 py-1.5 text-[11px] text-white/80 backdrop-blur-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-rose/40"
        style={{ width: `${progress * 100}%`, transition: "width 0.09s linear" }}
      />
      <span className="relative">
        {isHolding ? copy.hub.garden.resetHold : copy.hub.garden.reset}
      </span>
    </button>
  );
}
