"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RoomId } from "@/lib/house-catalog";
import {
  createDefaultHouse,
  loadHouse,
  saveHouse,
  type ExteriorPart,
  type HouseState,
} from "@/lib/house";

interface HouseValue {
  house: HouseState;
  /** Set an exterior part (wall / roof / roofColor / door / doorColor / windows). */
  setExterior: (part: ExteriorPart, id: string) => void;
  /** Set the yard item at a position, or `null` to clear it. */
  setYardSlot: (index: number, id: string | null) => void;
  /** Repaint a room's wall or refloor it. */
  setRoomSurface: (roomId: RoomId, surface: "wall" | "floor", id: string) => void;
  /** Put a furniture piece in a room slot, or `null` to empty it. */
  setRoomSlot: (roomId: RoomId, slotId: string, id: string | null) => void;
  /** Back to the starter home. */
  resetHouse: () => void;
}

const HouseContext = createContext<HouseValue | null>(null);

/**
 * Owns the house's device-persisted state, mirroring `KeepsakeProvider`: a lazy
 * initializer reads `localStorage` directly (safe — the hub only mounts on the
 * client, behind `RomanticExperience`'s veil) and every change is written back.
 */
export function HouseProvider({ children }: { children: ReactNode }) {
  const [house, setHouse] = useState<HouseState>(loadHouse);

  useEffect(() => {
    saveHouse(house);
  }, [house]);

  const setExterior = useCallback((part: ExteriorPart, id: string) => {
    setHouse((current) =>
      current.exterior[part] === id
        ? current
        : { ...current, exterior: { ...current.exterior, [part]: id } },
    );
  }, []);

  const setYardSlot = useCallback((index: number, id: string | null) => {
    setHouse((current) => {
      if (current.exterior.yard[index] === id) return current;
      const yard = [...current.exterior.yard];
      yard[index] = id;
      return { ...current, exterior: { ...current.exterior, yard } };
    });
  }, []);

  const setRoomSurface = useCallback(
    (roomId: RoomId, surface: "wall" | "floor", id: string) => {
      setHouse((current) =>
        current.rooms[roomId][surface] === id
          ? current
          : {
              ...current,
              rooms: {
                ...current.rooms,
                [roomId]: { ...current.rooms[roomId], [surface]: id },
              },
            },
      );
    },
    [],
  );

  const setRoomSlot = useCallback(
    (roomId: RoomId, slotId: string, id: string | null) => {
      setHouse((current) =>
        current.rooms[roomId].slots[slotId] === id
          ? current
          : {
              ...current,
              rooms: {
                ...current.rooms,
                [roomId]: {
                  ...current.rooms[roomId],
                  slots: { ...current.rooms[roomId].slots, [slotId]: id },
                },
              },
            },
      );
    },
    [],
  );

  const resetHouse = useCallback(() => setHouse(createDefaultHouse()), []);

  const value = useMemo<HouseValue>(
    () => ({
      house,
      setExterior,
      setYardSlot,
      setRoomSurface,
      setRoomSlot,
      resetHouse,
    }),
    [house, setExterior, setYardSlot, setRoomSurface, setRoomSlot, resetHouse],
  );

  return <HouseContext.Provider value={value}>{children}</HouseContext.Provider>;
}

export function useHouse(): HouseValue {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error("useHouse must be used within a HouseProvider");
  }
  return context;
}
