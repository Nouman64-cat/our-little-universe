/**
 * The curated catalog for "our place" — every part of the house she and Cheeku
 * can change, as plain data. The SVG that draws each option lives in the parts
 * registry (`components/romantic-experience/hub/house/parts/registry.tsx`);
 * this file is pure data so it can be imported anywhere, including
 * `lib/house.ts`'s shape guard.
 *
 * To add an option later: add an entry here + one drawing in the registry.
 */

export interface ColorOption {
  id: string;
  label: string;
  /** Illustration hex — deliberately fixed, it reads the same in both themes. */
  hex: string;
}

export interface StyleOption {
  id: string;
  label: string;
}

export interface FloorOption {
  id: string;
  label: string;
  base: string;
  /** Second tone for planks / grout / checker squares. */
  accent: string;
  pattern: "wood" | "tile" | "checker" | "carpet" | "stone";
}

// ── Exterior ────────────────────────────────────────────────────────────────

export const WALL_COLORS: readonly ColorOption[] = [
  { id: "cream", label: "cream", hex: "#f2e7d5" },
  { id: "blush", label: "blush", hex: "#f0d2d8" },
  { id: "sage", label: "sage", hex: "#cdd8c3" },
  { id: "sky", label: "sky", hex: "#cfe0e6" },
  { id: "lilac", label: "lilac", hex: "#ddd4ec" },
  { id: "clay", label: "clay", hex: "#e4b89e" },
  { id: "honey", label: "honey", hex: "#f0dcae" },
  { id: "stone", label: "stone", hex: "#dcd6cd" },
];

export const ROOF_SHAPES: readonly StyleOption[] = [
  { id: "gable", label: "gable" },
  { id: "hip", label: "hip" },
  { id: "flat", label: "flat" },
  { id: "curved", label: "curved" },
];

export const ROOF_COLORS: readonly ColorOption[] = [
  { id: "charcoal", label: "charcoal", hex: "#4a4550" },
  { id: "brick", label: "brick", hex: "#b5654c" },
  { id: "forest", label: "forest", hex: "#4c6b53" },
  { id: "plum", label: "plum", hex: "#6b4a63" },
  { id: "denim", label: "denim", hex: "#5a6f8c" },
  { id: "wheat", label: "wheat", hex: "#c9a26b" },
];

export const DOOR_SHAPES: readonly StyleOption[] = [
  { id: "panel", label: "panel" },
  { id: "arched", label: "arched" },
  { id: "cottage", label: "cottage" },
  { id: "double", label: "double" },
];

export const DOOR_COLORS: readonly ColorOption[] = [
  { id: "rose", label: "rose", hex: "#d16f92" },
  { id: "teal", label: "teal", hex: "#3f8f89" },
  { id: "mustard", label: "mustard", hex: "#d7a13e" },
  { id: "navy", label: "navy", hex: "#3c4a73" },
  { id: "cream", label: "cream", hex: "#efe6d4" },
  { id: "wood", label: "wood", hex: "#9a6b46" },
];

export const WINDOW_SHAPES: readonly StyleOption[] = [
  { id: "square", label: "square" },
  { id: "arched", label: "arched" },
  { id: "round", label: "round" },
  { id: "bay", label: "bay" },
];

/** Front-yard pieces. A slot can also be empty (`null`). */
export const YARD_ITEMS: readonly StyleOption[] = [
  { id: "tree", label: "little tree" },
  { id: "lilies", label: "lily patch" },
  { id: "bench", label: "bench" },
  { id: "lamppost", label: "lamppost" },
  { id: "hedge", label: "hedge" },
  { id: "pot", label: "flower pot" },
  { id: "birdbath", label: "birdbath" },
  { id: "path", label: "stepping stones" },
];

/** Number of front-yard positions (one either side of the path). */
export const YARD_SLOTS = 2;

// ── Interior ────────────────────────────────────────────────────────────────

export type RoomId = "living" | "bedroom" | "kitchen" | "bathroom";

export type SlotCategory =
  | "seat"
  | "bed"
  | "rug"
  | "table"
  | "counter"
  | "bath"
  | "vanity"
  | "wall"
  | "accent";

export interface Slot {
  id: string;
  category: SlotCategory;
  /** Anchor inside the room box, as % (x from left, y = baseline from top). */
  x: number;
  y: number;
  /** Rough width as % of the room, for scaling the piece. */
  w: number;
}

export interface RoomDef {
  id: RoomId;
  label: string;
  slots: readonly Slot[];
}

/**
 * Slot `x`/`y` are percentages of the single-room view (`y` = the piece's
 * baseline from the top of the room); `w` is a rough width as a % of the room.
 */
export const ROOMS: readonly RoomDef[] = [
  {
    id: "living",
    label: "lounge",
    slots: [
      { id: "rug", category: "rug", x: 50, y: 82, w: 74 },
      { id: "sofa", category: "seat", x: 42, y: 71, w: 56 },
      { id: "table", category: "table", x: 58, y: 80, w: 24 },
      { id: "art", category: "wall", x: 50, y: 41, w: 30 },
    ],
  },
  {
    id: "bedroom",
    label: "bedroom",
    slots: [
      { id: "rug", category: "rug", x: 50, y: 84, w: 58 },
      { id: "bed", category: "bed", x: 47, y: 72, w: 62 },
      { id: "lamp", category: "accent", x: 90, y: 70, w: 16 },
      { id: "art", category: "wall", x: 50, y: 41, w: 26 },
    ],
  },
  {
    id: "kitchen",
    label: "kitchen",
    slots: [
      { id: "counter", category: "counter", x: 36, y: 72, w: 58 },
      { id: "table", category: "table", x: 81, y: 80, w: 28 },
      { id: "stool", category: "accent", x: 81, y: 76, w: 14 },
      { id: "shelf", category: "wall", x: 52, y: 41, w: 30 },
    ],
  },
  {
    id: "bathroom",
    label: "bath",
    slots: [
      { id: "tub", category: "bath", x: 42, y: 72, w: 58 },
      { id: "sink", category: "vanity", x: 82, y: 74, w: 28 },
      { id: "mirror", category: "wall", x: 82, y: 41, w: 18 },
      { id: "plant", category: "accent", x: 15, y: 82, w: 16 },
    ],
  },
];

export const WALL_PAINTS: readonly ColorOption[] = [
  { id: "warmwhite", label: "warm white", hex: "#f4ede2" },
  { id: "blush", label: "blush", hex: "#f2dde0" },
  { id: "sage", label: "sage", hex: "#d7e0d0" },
  { id: "sky", label: "sky", hex: "#d8e6ea" },
  { id: "lilac", label: "lilac", hex: "#e4dcef" },
  { id: "butter", label: "butter", hex: "#f4e7c4" },
  { id: "terracotta", label: "terracotta", hex: "#e8c3ac" },
  { id: "clay-grey", label: "greige", hex: "#ddd7cd" },
];

export const FLOOR_STYLES: readonly FloorOption[] = [
  { id: "oak", label: "oak boards", base: "#d9b48a", accent: "#c39a6d", pattern: "wood" },
  { id: "walnut", label: "walnut", base: "#a9784f", accent: "#8c603c", pattern: "wood" },
  { id: "tile", label: "pale tile", base: "#e4ded2", accent: "#cfc7b6", pattern: "tile" },
  { id: "checker", label: "checker", base: "#efe7d8", accent: "#c9b79c", pattern: "checker" },
  { id: "carpet", label: "soft carpet", base: "#e7d7dd", accent: "#d9c3cc", pattern: "carpet" },
  { id: "stone", label: "stone", base: "#d5d0c6", accent: "#bcb6aa", pattern: "stone" },
];

/** Furniture options per slot category. Any slot can also be left empty. */
export const FURNITURE: Record<SlotCategory, readonly StyleOption[]> = {
  seat: [
    { id: "sofa-curved", label: "curved sofa" },
    { id: "sofa-boxy", label: "boxy sofa" },
    { id: "loveseat", label: "loveseat" },
    { id: "armchairs", label: "two armchairs" },
  ],
  bed: [
    { id: "bed-simple", label: "simple bed" },
    { id: "bed-canopy", label: "canopy bed" },
    { id: "bed-low", label: "low platform" },
  ],
  rug: [
    { id: "rug-round", label: "round rug" },
    { id: "rug-rect", label: "rectangle rug" },
    { id: "rug-runner", label: "runner" },
    { id: "rug-shag", label: "shaggy rug" },
  ],
  table: [
    { id: "table-round", label: "round table" },
    { id: "table-rect", label: "long table" },
    { id: "table-nest", label: "nesting tables" },
    { id: "table-trunk", label: "trunk table" },
  ],
  counter: [
    { id: "counter-straight", label: "straight counter" },
    { id: "counter-l", label: "L counter" },
    { id: "island", label: "kitchen island" },
  ],
  bath: [
    { id: "tub-clawfoot", label: "clawfoot tub" },
    { id: "tub-modern", label: "modern tub" },
    { id: "shower", label: "shower" },
  ],
  vanity: [
    { id: "sink-pedestal", label: "pedestal sink" },
    { id: "vanity-cabinet", label: "vanity cabinet" },
    { id: "vanity-double", label: "double vanity" },
  ],
  wall: [
    { id: "art-single", label: "one painting" },
    { id: "art-trio", label: "gallery wall" },
    { id: "mirror", label: "round mirror" },
    { id: "shelf", label: "little shelf" },
  ],
  accent: [
    { id: "floor-lamp", label: "floor lamp" },
    { id: "plant", label: "potted plant" },
    { id: "stool", label: "stool" },
    { id: "cushion", label: "floor cushion" },
  ],
};

// ── Shape-guard helpers (used by lib/house.ts) ──────────────────────────────

const idSet = (opts: readonly { id: string }[]) => new Set(opts.map((o) => o.id));

export const VALID = {
  wall: idSet(WALL_COLORS),
  roof: idSet(ROOF_SHAPES),
  roofColor: idSet(ROOF_COLORS),
  door: idSet(DOOR_SHAPES),
  doorColor: idSet(DOOR_COLORS),
  windows: idSet(WINDOW_SHAPES),
  yard: idSet(YARD_ITEMS),
  roomWall: idSet(WALL_PAINTS),
  roomFloor: idSet(FLOOR_STYLES),
} as const;

/** Every furniture id that's legal for a given slot category. */
export function slotOptionIds(category: SlotCategory): Set<string> {
  return new Set(FURNITURE[category].map((o) => o.id));
}

export function roomDef(id: RoomId): RoomDef {
  return ROOMS.find((r) => r.id === id) as RoomDef;
}
