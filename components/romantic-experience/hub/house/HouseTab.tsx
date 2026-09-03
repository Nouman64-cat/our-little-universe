"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NAMES, PLANT_DURATION_MS, copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { haptic } from "@/lib/utils";
import type { HubTab } from "@/types/experience";
import { useKeepsakes } from "../keepsake-context";
import { useHouse } from "../house-context";
import { TabScreen } from "../ui/TabScreen";
import { SheetOverlay } from "../ui/SheetOverlay";
import { HouseExterior } from "./HouseExterior";
import { HouseInterior } from "./HouseInterior";
import { HouseEditor } from "./HouseEditor";
import type { Selection } from "./selection";

interface HouseTabProps {
  onNavigate: (tab: HubTab) => void;
  onReplayJourney: () => void;
}

const c = copy.hub.house;

export function HouseTab({ onNavigate, onReplayJourney }: HouseTabProps) {
  const reduceMotion = useReducedMotion();
  const { house, resetHouse } = useHouse();
  const { timeGreeting, nickname, greetingLine, firstUnreadLetter, blooms } =
    useKeepsakes();

  const [view, setView] = useState<"outside" | "inside">("outside");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);

  const fade = (delay: number) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_SOFT, delay },
  });

  const toggleEditing = useCallback(() => {
    haptic(6);
    setEditing((e) => !e);
    setSelected(null);
  }, []);

  const switchView = useCallback((next: "outside" | "inside") => {
    haptic(4);
    setView(next);
    setSelected(null);
  }, []);

  const signLine = `${NAMES.her} & ${NAMES.him}`;

  return (
    <TabScreen>
      <div className="flex flex-1 flex-col">
        {/* greeting — kept from the old home screen */}
        <motion.div {...fade(0.1)} className="mb-4 text-center">
          <h1 className="font-display text-[1.7rem] font-medium leading-tight text-ink">
            {timeGreeting},{" "}
            <span className="text-rose-bright">{nickname}.</span>
          </h1>
          <p
            suppressHydrationWarning
            className="mt-1.5 font-display text-sm italic text-ink-muted"
          >
            {greetingLine}
          </p>
        </motion.div>

        {/* the house */}
        <motion.div
          {...fade(0.24)}
          className="relative mx-auto w-full max-w-[22rem] overflow-hidden rounded-[1.6rem] border border-hairline shadow-[0_18px_50px_-26px_rgba(0,0,0,0.5)]"
        >
          <div className={view === "outside" ? "aspect-[10/9]" : "aspect-[3/4]"}>
            {view === "outside" ? (
              <HouseExterior
                exterior={house.exterior}
                greeting={signLine}
                hasUnreadLetter={firstUnreadLetter !== null}
                lilyCount={blooms.length}
                editing={editing}
                selected={selected}
                onSelect={setSelected}
                onOpenLetters={() => onNavigate("us")}
                onOpenGarden={() => onNavigate("garden")}
              />
            ) : (
              <HouseInterior
                house={house}
                editing={editing}
                selected={selected}
                onSelect={setSelected}
              />
            )}
          </div>
        </motion.div>

        {/* controls */}
        <motion.div {...fade(0.38)} className="mx-auto mt-4 flex w-full max-w-[22rem] items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleEditing}
            aria-pressed={editing}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
              editing
                ? "border-rose bg-rose/15 text-ink"
                : "border-hairline bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {editing ? c.done : c.decorate}
          </button>

          <button
            type="button"
            onClick={() => switchView(view === "outside" ? "inside" : "outside")}
            className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          >
            {view === "outside" ? c.stepInside : c.goOutside}
          </button>
        </motion.div>

        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto mt-4 flex w-full max-w-[22rem] flex-col items-center gap-3"
          >
            <p className="text-center text-xs text-ink-faint">{c.hint}</p>
            <ResetButton onReset={resetHouse} />
          </motion.div>
        )}

        <div className="flex-1" />

        <motion.button
          {...fade(0.5)}
          type="button"
          onClick={onReplayJourney}
          className="mx-auto mt-6 text-xs text-ink-faint/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          {copy.hub.home.replay}
        </motion.button>
      </div>

      <SheetOverlay
        open={editing && selected !== null}
        onClose={() => setSelected(null)}
        label="Change this part of the house"
      >
        {selected && <HouseEditor selection={selected} house={house} />}
      </SheetOverlay>
    </TabScreen>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const { progress, isHolding, handlers } = useHoldProgress({
    durationMs: PLANT_DURATION_MS,
    onComplete: onReset,
  });

  return (
    <button
      type="button"
      {...handlers}
      className="relative overflow-hidden rounded-full border border-hairline px-4 py-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-rose/20"
        style={{ width: `${progress * 100}%`, transition: "width 0.09s linear" }}
      />
      <span className="relative">{isHolding ? copy.hub.house.resetHold : copy.hub.house.reset}</span>
    </button>
  );
}
