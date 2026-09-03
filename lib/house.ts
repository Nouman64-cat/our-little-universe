/**
 * "Our place" — the house she and Cheeku decorate, persisted on the device.
 * Mirrors `lib/storage.ts`: a small typed shape, a full default, and load/save
 * that treat any missing or corrupt value as "just use the default".
 *
 * Kept separate from `olu:v1` (its own key, its own provider) because the house
 * has no daily logic and `keepsake-context` is already large.
 */

import {
  FLOOR_STYLES,
  ROOMS,
  VALID,
  WALL_PAINTS,
  YARD_SLOTS,
  roomDef,
  slotOptionIds,
  type RoomId,
} from "./house-catalog";

export interface ExteriorState {
  wall: string;
  roof: string;
  roofColor: string;
  door: string;
  doorColor: string;
  windows: string;
  /** One entry per yard position; `null` = empty. */
  yard: (string | null)[];
}

export interface RoomState {
  wall: string;
  floor: string;
  /** Keyed by slot id; `null` = the slot is left empty. */
  slots: Record<string, string | null>;
}

export interface HouseState {
  exterior: ExteriorState;
  rooms: Record<RoomId, RoomState>;
}

export type ExteriorPart = keyof Omit<ExteriorState, "yard">;

const STORAGE_KEY = "olu:house:v1";

const DEFAULT_EXTERIOR: ExteriorState = {
  wall: "cream",
  roof: "gable",
  roofColor: "brick",
  door: "panel",
  doorColor: "rose",
  windows: "square",
  yard: ["tree", "bench"],
};

const DEFAULT_ROOM_SLOTS: Record<RoomId, Record<string, string | null>> = {
  living: { sofa: "sofa-curved", rug: "rug-round", table: "table-round", art: "art-trio" },
  bedroom: { bed: "bed-simple", rug: "rug-rect", lamp: "floor-lamp", art: "art-single" },
  kitchen: { counter: "table-rect", table: "table-round", stool: "stool", shelf: "shelf" },
};

const DEFAULT_ROOM_SURFACES: Record<RoomId, { wall: string; floor: string }> = {
  living: { wall: "warmwhite", floor: "oak" },
  bedroom: { wall: "blush", floor: "carpet" },
  kitchen: { wall: "sage", floor: "checker" },
};

/** A fresh, fully-populated default house (never shares nested references). */
export function createDefaultHouse(): HouseState {
  return {
    exterior: { ...DEFAULT_EXTERIOR, yard: [...DEFAULT_EXTERIOR.yard] },
    rooms: Object.fromEntries(
      ROOMS.map((room) => [
        room.id,
        {
          wall: DEFAULT_ROOM_SURFACES[room.id].wall,
          floor: DEFAULT_ROOM_SURFACES[room.id].floor,
          slots: { ...DEFAULT_ROOM_SLOTS[room.id] },
        },
      ]),
    ) as Record<RoomId, RoomState>,
  };
}

function pick(value: unknown, valid: Set<string>, fallback: string): string {
  return typeof value === "string" && valid.has(value) ? value : fallback;
}

function coerceExterior(raw: unknown): ExteriorState {
  const r = (raw ?? {}) as Partial<ExteriorState>;
  const yardRaw = Array.isArray(r.yard) ? r.yard : [];
  const yard: (string | null)[] = Array.from({ length: YARD_SLOTS }, (_, i) => {
    const v = yardRaw[i];
    return typeof v === "string" && VALID.yard.has(v) ? v : null;
  });
  return {
    wall: pick(r.wall, VALID.wall, DEFAULT_EXTERIOR.wall),
    roof: pick(r.roof, VALID.roof, DEFAULT_EXTERIOR.roof),
    roofColor: pick(r.roofColor, VALID.roofColor, DEFAULT_EXTERIOR.roofColor),
    door: pick(r.door, VALID.door, DEFAULT_EXTERIOR.door),
    doorColor: pick(r.doorColor, VALID.doorColor, DEFAULT_EXTERIOR.doorColor),
    windows: pick(r.windows, VALID.windows, DEFAULT_EXTERIOR.windows),
    yard,
  };
}

function coerceRoom(roomId: RoomId, raw: unknown): RoomState {
  const r = (raw ?? {}) as Partial<RoomState>;
  const surfaces = DEFAULT_ROOM_SURFACES[roomId];
  const rawSlots = (r.slots ?? {}) as Record<string, unknown>;
  const slots: Record<string, string | null> = {};
  for (const slot of roomDef(roomId).slots) {
    const v = rawSlots[slot.id];
    slots[slot.id] =
      typeof v === "string" && slotOptionIds(slot.category).has(v) ? v : DEFAULT_ROOM_SLOTS[roomId][slot.id] ?? null;
    // An explicit null in storage means "left empty" — honour it.
    if (v === null) slots[slot.id] = null;
  }
  return {
    wall: pick(r.wall, VALID.roomWall, surfaces.wall),
    floor: pick(r.floor, VALID.roomFloor, surfaces.floor),
    slots,
  };
}

export function loadHouse(): HouseState {
  if (typeof window === "undefined") return createDefaultHouse();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultHouse();
    const parsed = JSON.parse(raw) as Partial<HouseState>;
    return {
      exterior: coerceExterior(parsed.exterior),
      rooms: Object.fromEntries(
        ROOMS.map((room) => [room.id, coerceRoom(room.id, parsed.rooms?.[room.id])]),
      ) as Record<RoomId, RoomState>,
    };
  } catch {
    return createDefaultHouse();
  }
}

export function saveHouse(state: HouseState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — the house just won't persist this session.
  }
}

/** Referenced by the editor to know if a floor id is dark (for contrast). */
export const FLOOR_BY_ID = Object.fromEntries(FLOOR_STYLES.map((f) => [f.id, f]));
export const WALL_PAINT_BY_ID = Object.fromEntries(WALL_PAINTS.map((w) => [w.id, w]));
