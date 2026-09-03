"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NAMES, PLANT_DURATION_MS, copy } from "@/lib/config";
import { ROOMS, type RoomId } from "@/lib/house-catalog";
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
  const { timeGreeting, nickname, greetingLine, letterWaiting, blooms } =
    useKeepsakes();

  const [view, setView] = useState<"outside" | "inside">("outside");
  const [roomId, setRoomId] = useState<RoomId>(ROOMS[0].id);
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

  const selectRoom = useCallback((next: RoomId) => {
    haptic(4);
    setRoomId(next);
    setSelected(null);
  }, []);

  const signLine = `${NAMES.her} & ${NAMES.him}`;

  return (
    <TabScreen bare>
      <div className="relative min-h-dvh w-full overflow-hidden bg-canvas">
        {/* the house fills the whole screen */}
        <motion.div
          key={view === "inside" ? `room-${roomId}` : "outside"}
          className="absolute inset-0"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE_SOFT }}
        >
          {view === "outside" ? (
            <HouseExterior
              exterior={house.exterior}
              greeting={signLine}
              hasUnreadLetter={letterWaiting}
              lilyCount={blooms.length}
              editing={editing}
              selected={selected}
              onSelect={setSelected}
              onOpenLetters={() => onNavigate("us")}
              onOpenGarden={() => onNavigate("garden")}
            />
          ) : (
            <HouseInterior
              roomId={roomId}
              room={house.rooms[roomId]}
              editing={editing}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </motion.div>

        {/* room picker — only inside */}
        {view === "inside" && (
          <motion.div
            {...fade(0.22)}
            className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+6.75rem)] flex justify-center px-4"
          >
            <div className="flex gap-0.5 rounded-full border border-white/25 bg-black/40 p-1 backdrop-blur-md">
              {ROOMS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRoom(r.id)}
                  aria-pressed={roomId === r.id}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
                    roomId === r.id ? "bg-rose/35 text-white" : "text-white/75 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* soft scrim so the floated chrome stays legible over any sky */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/35 via-black/12 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* greeting — floated over the sky */}
        <motion.div
          {...fade(0.15)}
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-center"
        >
          <h1 className="font-display text-[1.6rem] font-medium leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
            {timeGreeting}, <span className="text-rose-bright">{nickname}.</span>
          </h1>
          <p
            suppressHydrationWarning
            className="mt-1 font-display text-sm italic text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
          >
            {greetingLine}
          </p>
        </motion.div>

        {/* controls — a small floating cluster above the nav, centred so the
            yard/mailbox on the scene edges stay tappable */}
        <motion.div
          {...fade(0.32)}
          className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] flex flex-col items-center gap-2 px-6"
        >
          {editing && <p className="text-center text-[11px] text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">{c.hint}</p>}
          <div className="flex items-center gap-1 rounded-full border border-white/25 bg-black/35 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={toggleEditing}
              aria-pressed={editing}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
                editing ? "bg-rose/30 text-white" : "text-white/85 hover:text-white"
              }`}
            >
              {editing ? c.done : c.decorate}
            </button>
            <button
              type="button"
              onClick={() => switchView(view === "outside" ? "inside" : "outside")}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
            >
              {view === "outside" ? c.stepInside : c.goOutside}
            </button>
          </div>
          {editing ? (
            <ResetButton onReset={resetHouse} />
          ) : (
            <button
              type="button"
              onClick={onReplayJourney}
              className="text-[11px] text-white/75 underline decoration-dotted underline-offset-4 transition-colors hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
            >
              {copy.hub.home.replay}
            </button>
          )}
        </motion.div>
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
      className="relative touch-none overflow-hidden rounded-full border border-white/25 bg-black/30 px-4 py-1.5 text-[11px] text-white/80 backdrop-blur-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-rose/40"
        style={{ width: `${progress * 100}%`, transition: "width 0.09s linear" }}
      />
      <span className="relative">{isHolding ? copy.hub.house.resetHold : copy.hub.house.reset}</span>
    </button>
  );
}
