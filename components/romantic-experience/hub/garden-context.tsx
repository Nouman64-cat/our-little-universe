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
import {
  DEFAULT_DECOR,
  loadGardenDecor,
  saveGardenDecor,
  type FenceStyle,
  type GardenDecor,
  type GateStyle,
  type PathStyle,
} from "@/lib/garden-decor";

interface GardenDecorValue {
  decor: GardenDecor;
  setFence: (id: FenceStyle) => void;
  setGate: (id: GateStyle) => void;
  setPath: (id: PathStyle) => void;
  /** Back to the starter fence / gate / path. */
  resetDecor: () => void;
}

const GardenDecorContext = createContext<GardenDecorValue | null>(null);

/**
 * Owns the garden's fence / gate / path, mirroring `HouseProvider`: a lazy
 * initializer reads `localStorage` directly (safe — the hub only mounts on the
 * client) and every change is written straight back.
 */
export function GardenDecorProvider({ children }: { children: ReactNode }) {
  const [decor, setDecor] = useState<GardenDecor>(loadGardenDecor);

  useEffect(() => {
    saveGardenDecor(decor);
  }, [decor]);

  const setFence = useCallback((id: FenceStyle) => {
    setDecor((d) => (d.fence === id ? d : { ...d, fence: id }));
  }, []);
  const setGate = useCallback((id: GateStyle) => {
    setDecor((d) => (d.gate === id ? d : { ...d, gate: id }));
  }, []);
  const setPath = useCallback((id: PathStyle) => {
    setDecor((d) => (d.path === id ? d : { ...d, path: id }));
  }, []);
  const resetDecor = useCallback(() => setDecor({ ...DEFAULT_DECOR }), []);

  const value = useMemo<GardenDecorValue>(
    () => ({ decor, setFence, setGate, setPath, resetDecor }),
    [decor, setFence, setGate, setPath, resetDecor],
  );

  return (
    <GardenDecorContext.Provider value={value}>
      {children}
    </GardenDecorContext.Provider>
  );
}

export function useGardenDecor(): GardenDecorValue {
  const context = useContext(GardenDecorContext);
  if (!context) {
    throw new Error("useGardenDecor must be used within a GardenDecorProvider");
  }
  return context;
}
