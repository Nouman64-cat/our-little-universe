/**
 * The garden's fence, gate and path — the pieces she styles herself. Persisted
 * on the device under its own key, mirroring `lib/house.ts`: a tiny typed
 * shape, a full default, and a load/save that treats anything missing or
 * corrupt as "just use the default". No daily logic, so it lives outside
 * `olu:v1` / `keepsake-context`.
 */

export const FENCE_OPTIONS = [
  { id: "picket", label: "picket" },
  { id: "rail", label: "ranch rail" },
  { id: "lattice", label: "lattice" },
  { id: "stone", label: "stone wall" },
  { id: "hedge", label: "hedge" },
  { id: "none", label: "none" },
] as const;

export const GATE_OPTIONS = [
  { id: "arch", label: "lily arch" },
  { id: "picket", label: "picket gate" },
  { id: "iron", label: "iron gate" },
  { id: "none", label: "open" },
] as const;

export const PATH_OPTIONS = [
  { id: "stone", label: "flagstone" },
  { id: "brick", label: "brick" },
  { id: "gravel", label: "gravel" },
  { id: "stepping", label: "stepping stones" },
  { id: "none", label: "none" },
] as const;

export type FenceStyle = (typeof FENCE_OPTIONS)[number]["id"];
export type GateStyle = (typeof GATE_OPTIONS)[number]["id"];
export type PathStyle = (typeof PATH_OPTIONS)[number]["id"];

/** Which piece of the garden the editor sheet is currently changing. */
export type GardenPart = "fence" | "gate" | "path";

export interface GardenDecor {
  fence: FenceStyle;
  gate: GateStyle;
  path: PathStyle;
}

export const DEFAULT_DECOR: GardenDecor = {
  fence: "picket",
  gate: "arch",
  path: "stone",
};

const FENCE_IDS = new Set<string>(FENCE_OPTIONS.map((o) => o.id));
const GATE_IDS = new Set<string>(GATE_OPTIONS.map((o) => o.id));
const PATH_IDS = new Set<string>(PATH_OPTIONS.map((o) => o.id));

export const isFenceStyle = (v: unknown): v is FenceStyle =>
  typeof v === "string" && FENCE_IDS.has(v);
export const isGateStyle = (v: unknown): v is GateStyle =>
  typeof v === "string" && GATE_IDS.has(v);
export const isPathStyle = (v: unknown): v is PathStyle =>
  typeof v === "string" && PATH_IDS.has(v);

const STORAGE_KEY = "olu:garden:v1";

export function loadGardenDecor(): GardenDecor {
  if (typeof window === "undefined") return { ...DEFAULT_DECOR };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DECOR };
    const parsed = JSON.parse(raw) as Partial<GardenDecor>;
    return {
      fence: isFenceStyle(parsed.fence) ? parsed.fence : DEFAULT_DECOR.fence,
      gate: isGateStyle(parsed.gate) ? parsed.gate : DEFAULT_DECOR.gate,
      path: isPathStyle(parsed.path) ? parsed.path : DEFAULT_DECOR.path,
    };
  } catch {
    return { ...DEFAULT_DECOR };
  }
}

export function saveGardenDecor(decor: GardenDecor): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decor));
  } catch {
    // private mode / quota — it just won't persist this session
  }
}
