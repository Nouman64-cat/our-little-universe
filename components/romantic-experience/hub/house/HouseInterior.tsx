"use client";

import { useId } from "react";
import { ROOF_COLORS, ROOMS, WALL_PAINTS, type RoomDef } from "@/lib/house-catalog";
import type { HouseState, RoomState } from "@/lib/house";
import { Furniture, FURNITURE_BOX } from "./parts/Furniture";
import { FloorFill } from "./parts/FloorFill";
import { darken } from "./parts/shade";
import type { Selection } from "./selection";

const paintHex = (id: string) =>
  (WALL_PAINTS.find((w) => w.id === id) ?? WALL_PAINTS[0]).hex;
const roofHex = (id: string) =>
  (ROOF_COLORS.find((c) => c.id === id) ?? ROOF_COLORS[0]).hex;

interface HouseInteriorProps {
  house: HouseState;
  editing: boolean;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}

// The rooms tile the whole house body edge-to-edge; the outline is a thin frame.
const WALL = 2;
const OUT = { x: 16, y: 78, w: 268, bottom: 470 };
const AREA = {
  x: OUT.x + WALL,
  y: OUT.y + WALL,
  w: OUT.w - WALL * 2,
  h: OUT.bottom - OUT.y - WALL * 2,
};
const BAND_H = AREA.h / ROOMS.length;

export function HouseInterior({ house, editing, selected, onSelect }: HouseInteriorProps) {
  const roof = roofHex(house.exterior.roofColor);

  return (
    <svg
      viewBox="0 0 300 520"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Inside your house"
    >
      <defs>
        <linearGradient id="house-in-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efe6da" />
          <stop offset="100%" stopColor="#ddd0bd" />
        </linearGradient>
      </defs>
      {/* the room the doll-house sits in */}
      <rect x={-20} y={-20} width={340} height={560} fill="url(#house-in-bg)" />
      <ellipse cx={150} cy={OUT.bottom + 14} rx={130} ry={12} fill="rgba(0,0,0,0.12)" />

      {/* roof cap — sits right on the wall top */}
      <path
        d={`M${OUT.x - 14} ${OUT.y + 2} L150 26 L${OUT.x + OUT.w + 14} ${OUT.y + 2} Z`}
        fill={roof}
        stroke={darken(roof, 0.3)}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* house body — the rooms cover its fill; only the thin frame shows */}
      <rect x={OUT.x} y={OUT.y} width={OUT.w} height={OUT.bottom - OUT.y} fill="#c3b7a1" />

      {ROOMS.map((def, i) => {
        const box = { x: AREA.x, y: AREA.y + i * BAND_H, w: AREA.w, h: BAND_H };
        return (
          <Room
            key={def.id}
            def={def}
            state={house.rooms[def.id]}
            box={box}
            editing={editing}
            selected={selected}
            onSelect={onSelect}
          />
        );
      })}

      {/* band dividers + outer frame, over the rooms */}
      {ROOMS.slice(1).map((_, i) => (
        <line
          key={i}
          x1={AREA.x}
          y1={AREA.y + (i + 1) * BAND_H}
          x2={AREA.x + AREA.w}
          y2={AREA.y + (i + 1) * BAND_H}
          stroke="#c3b7a1"
          strokeWidth={3}
        />
      ))}
      <rect
        x={OUT.x}
        y={OUT.y}
        width={OUT.w}
        height={OUT.bottom - OUT.y}
        fill="none"
        stroke="#a89a82"
        strokeWidth={WALL * 2}
      />
    </svg>
  );
}

function Room({
  def,
  state,
  box,
  editing,
  selected,
  onSelect,
}: {
  def: RoomDef;
  state: RoomState;
  box: { x: number; y: number; w: number; h: number };
  editing: boolean;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  const clip = useId().replace(/:/g, "");
  const wall = paintHex(state.wall);
  const floorH = box.h * 0.24;
  const floorY = box.y + box.h - floorH;

  const wallSel = editing && selected?.kind === "roomWall" && selected.room === def.id;
  const floorSel = editing && selected?.kind === "roomFloor" && selected.room === def.id;

  return (
    <g>
      <clipPath id={clip}>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={wall} />
        <FloorFill floor={state.floor} x={box.x} y={floorY} w={box.w} h={floorH} />

        {def.slots.map((slot) => {
          const item = state.slots[slot.id];
          if (!item) return null;
          const scale = ((box.w * slot.w) / 100) / FURNITURE_BOX;
          const cx = box.x + (box.w * slot.x) / 100;
          const isWall = slot.category === "wall";
          const anchorY = box.y + (box.h * slot.y) / 100;
          const tx = cx - (FURNITURE_BOX * scale) / 2;
          const ty = isWall
            ? anchorY - (FURNITURE_BOX * scale) / 2
            : anchorY - FURNITURE_BOX * scale;
          return (
            <g key={slot.id} transform={`translate(${tx} ${ty}) scale(${scale})`}>
              <Furniture category={slot.category} variant={item} />
            </g>
          );
        })}
      </g>

      {/* edit layer — above the furniture so hotspots are always tappable */}
      {editing && (
        <>
          <EditRect
            x={box.x}
            y={box.y}
            w={box.w}
            h={box.h - floorH}
            active={wallSel}
            label={`${def.label} wall`}
            onSelect={() => onSelect({ kind: "roomWall", room: def.id })}
          />
          <EditRect
            x={box.x}
            y={floorY}
            w={box.w}
            h={floorH}
            active={floorSel}
            label={`${def.label} floor`}
            onSelect={() => onSelect({ kind: "roomFloor", room: def.id })}
          />
          {def.slots.map((slot) => {
            const cx = box.x + (box.w * slot.x) / 100;
            const isWall = slot.category === "wall";
            const anchorY = box.y + (box.h * slot.y) / 100;
            const hw = Math.max(20, (box.w * slot.w) / 100 * 0.7);
            return (
              <SlotHotspot
                key={slot.id}
                x={cx - hw / 2}
                y={anchorY - (isWall ? 18 : 34)}
                w={hw}
                h={isWall ? 34 : 36}
                active={
                  selected?.kind === "slot" &&
                  selected.room === def.id &&
                  selected.slotId === slot.id
                }
                empty={!state.slots[slot.id]}
                label={`${def.label} · ${slot.id}`}
                onSelect={() =>
                  onSelect({ kind: "slot", room: def.id, slotId: slot.id, category: slot.category })
                }
              />
            );
          })}
        </>
      )}
    </g>
  );
}

function EditRect({
  x,
  y,
  w,
  h,
  active,
  label,
  onSelect,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={active ? "rgba(255,158,196,0.14)" : "transparent"}
      stroke={active ? "#ff9ec4" : "rgba(255,158,196,0.4)"}
      strokeWidth={active ? 2 : 1}
      strokeDasharray={active ? undefined : "3 3"}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
    />
  );
}

function SlotHotspot({
  x,
  y,
  w,
  h,
  active,
  empty,
  label,
  onSelect,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  empty: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <g style={{ cursor: "pointer" }} role="button" tabIndex={0} aria-label={label} onClick={onSelect}
       onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={active ? "rgba(255,158,196,0.2)" : empty ? "rgba(255,158,196,0.08)" : "transparent"}
        stroke={active ? "#ff9ec4" : "rgba(255,158,196,0.6)"}
        strokeWidth={active ? 2 : 1.1}
        strokeDasharray={active ? undefined : "3 2"}
      />
      {empty && !active && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={13} fill="#ff9ec4">
          +
        </text>
      )}
    </g>
  );
}
