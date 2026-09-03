"use client";

import { WALL_PAINTS, roomDef, type RoomId } from "@/lib/house-catalog";
import type { RoomState } from "@/lib/house";
import { Furniture, FURNITURE_BOX } from "./parts/Furniture";
import { FloorFill } from "./parts/FloorFill";
import { darken, lighten } from "./parts/shade";
import type { Selection } from "./selection";

const paintHex = (id: string) =>
  (WALL_PAINTS.find((w) => w.id === id) ?? WALL_PAINTS[0]).hex;

interface HouseInteriorProps {
  roomId: RoomId;
  room: RoomState;
  editing: boolean;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}

/* One room, seen face-on and filling the screen. */
const VB = { w: 320, h: 640 };
const CEIL = 14;
const FLOOR_Y = 338;

export function HouseInterior({ roomId, room, editing, selected, onSelect }: HouseInteriorProps) {
  const def = roomDef(roomId);
  const wall = paintHex(room.wall);
  const wallShade = darken(wall, 0.08);
  const wallLift = lighten(wall, 0.4);

  const wallSel = editing && selected?.kind === "roomWall" && selected.room === roomId;
  const floorSel = editing && selected?.kind === "roomFloor" && selected.room === roomId;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      role="img"
      aria-label={`Your ${def.label}`}
    >
      {/* ceiling */}
      <rect x={0} y={0} width={VB.w} height={CEIL} fill={darken(wall, 0.16)} />
      {/* back wall */}
      <rect x={0} y={CEIL} width={VB.w} height={FLOOR_Y - CEIL} fill={wall} />
      <rect x={0} y={CEIL} width={VB.w} height={8} fill={wallShade} opacity={0.5} />

      {/* picture rail across the wall */}
      <rect x={0} y={FLOOR_Y - 96} width={VB.w} height={3} fill={darken(wall, 0.14)} opacity={0.55} />

      {/* window on the wall — a fixed cosy detail */}
      <g transform="translate(36 176)">
        <rect x={-5} y={-5} width={64} height={84} rx={4} fill={wallLift} />
        <rect x={0} y={0} width={54} height={74} rx={2} fill="#cfe2ea" stroke={darken(wall, 0.25)} strokeWidth={2.5} />
        <path d="M0 0 h54 v74 h-54 Z M27 0 v74 M0 37 h54" fill="none" stroke={darken(wall, 0.2)} strokeWidth={2} />
        <path d="M7 9 l11 11" stroke="#eef5f8" strokeWidth={3} />
        <circle cx={43} cy={13} r={4.5} fill="#fff3d6" />
      </g>

      {/* a little wall clock (the bath has its mirror on the right instead) */}
      {roomId !== "bathroom" && (
        <g transform="translate(278 272)">
          <circle cx={0} cy={0} r={15} fill={wallLift} stroke={darken(wall, 0.28)} strokeWidth={2} />
          <path d="M0 0 v-8 M0 0 l6 3" stroke={darken(wall, 0.4)} strokeWidth={1.6} strokeLinecap="round" />
          <circle cx={0} cy={0} r={1.4} fill={darken(wall, 0.4)} />
        </g>
      )}

      {/* floor */}
      <FloorFill floor={room.floor} x={0} y={FLOOR_Y} w={VB.w} h={VB.h - FLOOR_Y} />
      {/* wall / floor junction */}
      <rect x={0} y={FLOOR_Y - 4} width={VB.w} height={5} fill={darken(wall, 0.2)} opacity={0.6} />

      {/* furniture */}
      {def.slots.map((slot) => {
        const item = room.slots[slot.id];
        if (!item) return null;
        const scale = ((VB.w * slot.w) / 100) / FURNITURE_BOX;
        const cx = (VB.w * slot.x) / 100;
        const isWall = slot.category === "wall";
        const anchorY = CEIL + ((VB.h - CEIL) * slot.y) / 100;
        const tx = cx - (FURNITURE_BOX * scale) / 2;
        const ty = isWall
          ? anchorY - (FURNITURE_BOX * scale) / 2
          : anchorY - FURNITURE_BOX * scale;
        return (
          <g key={slot.id}>
            {/* soft contact shadow for floor pieces */}
            {!isWall && (
              <ellipse
                cx={cx}
                cy={anchorY - 2}
                rx={(FURNITURE_BOX * scale) / 2.6}
                ry={5}
                fill="rgba(0,0,0,0.07)"
              />
            )}
            <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
              <Furniture category={slot.category} variant={item} />
            </g>
          </g>
        );
      })}

      {/* edit layer — above the furniture so hotspots stay tappable */}
      {editing && (
        <>
          <EditRect
            x={0}
            y={CEIL}
            w={VB.w}
            h={FLOOR_Y - CEIL}
            active={wallSel}
            label={`${def.label} wall`}
            onSelect={() => onSelect({ kind: "roomWall", room: roomId })}
          />
          <EditRect
            x={0}
            y={FLOOR_Y}
            w={VB.w}
            h={VB.h - FLOOR_Y}
            active={floorSel}
            label={`${def.label} floor`}
            onSelect={() => onSelect({ kind: "roomFloor", room: roomId })}
          />
          {def.slots.map((slot) => {
            const cx = (VB.w * slot.x) / 100;
            const isWall = slot.category === "wall";
            const anchorY = CEIL + ((VB.h - CEIL) * slot.y) / 100;
            const hw = Math.max(40, (VB.w * slot.w) / 100 * 0.8);
            const hh = isWall ? 56 : 62;
            return (
              <SlotHotspot
                key={slot.id}
                x={cx - hw / 2}
                y={isWall ? anchorY - hh / 2 : anchorY - hh}
                w={hw}
                h={hh}
                active={
                  selected?.kind === "slot" &&
                  selected.room === roomId &&
                  selected.slotId === slot.id
                }
                empty={!room.slots[slot.id]}
                label={`${def.label} · ${slot.id}`}
                onSelect={() =>
                  onSelect({ kind: "slot", room: roomId, slotId: slot.id, category: slot.category })
                }
              />
            );
          })}
        </>
      )}
    </svg>
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
      strokeWidth={active ? 2.5 : 1.5}
      strokeDasharray={active ? undefined : "4 4"}
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
        rx={6}
        fill={active ? "rgba(255,158,196,0.22)" : empty ? "rgba(255,158,196,0.1)" : "transparent"}
        stroke={active ? "#ff9ec4" : "rgba(255,158,196,0.6)"}
        strokeWidth={active ? 2.5 : 1.4}
        strokeDasharray={active ? undefined : "4 3"}
      />
      {empty && !active && (
        <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize={18} fill="#ff9ec4">
          +
        </text>
      )}
    </g>
  );
}
