import type { RoomId } from "@/lib/house-catalog";

/** What the editor sheet is currently pointed at. `null` = sheet closed. */
export type Selection =
  | { kind: "wall" }
  | { kind: "roof" }
  | { kind: "door" }
  | { kind: "windows" }
  | { kind: "yard"; index: number }
  | { kind: "roomWall"; room: RoomId }
  | { kind: "roomFloor"; room: RoomId }
  | { kind: "slot"; room: RoomId; slotId: string; category: string };

export function sameSelection(a: Selection | null, b: Selection | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === "yard" && b.kind === "yard") return a.index === b.index;
  if (a.kind === "slot" && b.kind === "slot")
    return a.room === b.room && a.slotId === b.slotId;
  if ((a.kind === "roomWall" || a.kind === "roomFloor") && "room" in b)
    return a.room === b.room;
  return true;
}
