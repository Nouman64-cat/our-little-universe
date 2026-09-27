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
  MAX_PLOTS,
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
  /** Back to the starter fence / gate / path (the land she's added stays). */
  resetDecor: () => void;
  /** Add one more plot of land to the right, up to `MAX_PLOTS`. */
  expand: () => void;
  canExpand: boolean;
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
  // Resetting restyles the structure only — shrinking the land would strand
  // the flowers planted out there.
  const resetDecor = useCallback(
    () => setDecor((d) => ({ ...DEFAULT_DECOR, plots: d.plots })),
    [],
  );
  const expand = useCallback(() => {
    setDecor((d) =>
      d.plots >= MAX_PLOTS ? d : { ...d, plots: d.plots + 1 },
    );
  }, []);

  const value = useMemo<GardenDecorValue>(
    () => ({
      decor,
      setFence,
      setGate,
      setPath,
      resetDecor,
      expand,
      canExpand: decor.plots < MAX_PLOTS,
    }),
    [decor, setFence, setGate, setPath, resetDecor, expand],
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
