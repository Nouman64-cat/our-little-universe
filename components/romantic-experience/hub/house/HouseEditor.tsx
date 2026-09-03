"use client";

import type { ReactNode } from "react";
import {
  DOOR_COLORS,
  DOOR_SHAPES,
  FLOOR_STYLES,
  FURNITURE,
  ROOF_COLORS,
  ROOF_SHAPES,
  WALL_COLORS,
  WALL_PAINTS,
  WINDOW_SHAPES,
  YARD_ITEMS,
  roomDef,
  type ColorOption,
  type SlotCategory,
  type StyleOption,
} from "@/lib/house-catalog";
import type { HouseState } from "@/lib/house";
import { useHouse } from "../house-context";
import { Door, Roof, Window } from "./parts/structure";
import { Furniture } from "./parts/Furniture";
import { FloorFill } from "./parts/FloorFill";
import { YardItem } from "./parts/YardItem";
import type { Selection } from "./selection";

const hexOf = (list: readonly ColorOption[], id: string) =>
  (list.find((o) => o.id === id) ?? list[0]).hex;

export function HouseEditor({
  selection,
  house,
}: {
  selection: Selection;
  house: HouseState;
}) {
  const { setExterior, setYardSlot, setRoomSurface, setRoomSlot } = useHouse();
  const ext = house.exterior;

  switch (selection.kind) {
    case "wall":
      return (
        <Section title="walls">
          <SwatchRow
            options={WALL_COLORS}
            current={ext.wall}
            onPick={(id) => setExterior("wall", id)}
          />
        </Section>
      );

    case "roof":
      return (
        <Section title="roof">
          <TileRow
            label="shape"
            options={ROOF_SHAPES}
            current={ext.roof}
            onPick={(id) => id && setExterior("roof", id)}
            preview={(id) => (
              <Mini vb="0 0 80 30">
                <g transform="translate(2 1)">
                  <Roof shape={id} color={hexOf(ROOF_COLORS, ext.roofColor)} width={76} height={27} />
                </g>
              </Mini>
            )}
          />
          <SwatchRow
            label="colour"
            options={ROOF_COLORS}
            current={ext.roofColor}
            onPick={(id) => setExterior("roofColor", id)}
          />
        </Section>
      );

    case "door":
      return (
        <Section title="front door">
          <TileRow
            label="shape"
            options={DOOR_SHAPES}
            current={ext.door}
            onPick={(id) => id && setExterior("door", id)}
            preview={(id) => (
              <Mini vb="-3 -3 46 70">
                <Door shape={id} color={hexOf(DOOR_COLORS, ext.doorColor)} width={40} height={62} />
              </Mini>
            )}
          />
          <SwatchRow
            label="colour"
            options={DOOR_COLORS}
            current={ext.doorColor}
            onPick={(id) => setExterior("doorColor", id)}
          />
        </Section>
      );

    case "windows":
      return (
        <Section title="windows">
          <TileRow
            options={WINDOW_SHAPES}
            current={ext.windows}
            onPick={(id) => id && setExterior("windows", id)}
            preview={(id) => (
              <Mini vb="-4 -4 40 40">
                <Window shape={id} width={32} height={32} />
              </Mini>
            )}
          />
        </Section>
      );

    case "yard": {
      const idx = selection.index;
      return (
        <Section title={`yard · spot ${idx + 1}`}>
          <TileRow
            options={YARD_ITEMS}
            current={ext.yard[idx]}
            includeEmpty
            onPick={(id) => setYardSlot(idx, id)}
            preview={(id) => (
              <Mini vb="0 0 44 54">
                <YardItem variant={id} />
              </Mini>
            )}
          />
        </Section>
      );
    }

    case "roomWall": {
      const label = roomDef(selection.room).label;
      return (
        <Section title={`${label} · wall`}>
          <SwatchRow
            options={WALL_PAINTS}
            current={house.rooms[selection.room].wall}
            onPick={(id) => setRoomSurface(selection.room, "wall", id)}
          />
        </Section>
      );
    }

    case "roomFloor": {
      const label = roomDef(selection.room).label;
      return (
        <Section title={`${label} · floor`}>
          <TileRow
            options={FLOOR_STYLES}
            current={house.rooms[selection.room].floor}
            onPick={(id) => id && setRoomSurface(selection.room, "floor", id)}
            preview={(id) => (
              <Mini vb="0 0 80 30">
                <FloorFill floor={id} x={0} y={2} w={80} h={26} />
              </Mini>
            )}
          />
        </Section>
      );
    }

    case "slot": {
      const label = roomDef(selection.room).label;
      const category = selection.category as SlotCategory;
      return (
        <Section title={`${label} · ${selection.slotId}`}>
          <TileRow
            options={FURNITURE[category]}
            current={house.rooms[selection.room].slots[selection.slotId]}
            includeEmpty
            onPick={(id) => setRoomSlot(selection.room, selection.slotId, id)}
            preview={(id) => (
              <Mini vb="0 0 100 100">
                <Furniture category={category} variant={id} />
              </Mini>
            )}
          />
        </Section>
      );
    }

    default:
      return null;
  }
}

// ── building blocks ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium capitalize text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Mini({ vb, children }: { vb: string; children: ReactNode }) {
  return (
    <svg viewBox={vb} className="h-full w-full" aria-hidden>
      {children}
    </svg>
  );
}

function SwatchRow({
  label,
  options,
  current,
  onPick,
}: {
  label?: string;
  options: readonly ColorOption[];
  current: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      {label && <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-faint">{label}</p>}
      <div className="grid grid-cols-4 gap-2.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            aria-pressed={current === o.id}
            aria-label={o.label}
            className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
              current === o.id ? "border-rose bg-rose/10" : "border-hairline hover:bg-surface"
            }`}
          >
            <span
              className="h-9 w-full rounded-lg"
              style={{ backgroundColor: o.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
            />
            <span className="truncate text-[10px] text-ink-faint">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TileRow({
  label,
  options,
  current,
  onPick,
  preview,
  includeEmpty,
}: {
  label?: string;
  options: readonly StyleOption[];
  current: string | null | undefined;
  onPick: (id: string | null) => void;
  preview: (id: string) => ReactNode;
  includeEmpty?: boolean;
}) {
  return (
    <div>
      {label && <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-faint">{label}</p>}
      <div className="grid grid-cols-3 gap-2.5">
        {includeEmpty && (
          <button
            type="button"
            onClick={() => onPick(null)}
            aria-pressed={!current}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
              !current ? "border-rose bg-rose/10 text-ink" : "border-hairline text-ink-faint hover:bg-surface"
            }`}
          >
            leave empty
          </button>
        )}
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            aria-pressed={current === o.id}
            aria-label={o.label}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
              current === o.id ? "border-rose bg-rose/10" : "border-hairline hover:bg-surface"
            }`}
          >
            <span className="flex h-14 w-full items-center justify-center">{preview(o.id)}</span>
            <span className="truncate text-[10px] text-ink-faint">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
