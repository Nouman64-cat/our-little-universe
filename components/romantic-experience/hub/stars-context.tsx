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
import { STAR_COLORS, type Star, type StarColor } from "@/lib/stars";

type Status = "loading" | "ready" | "error";

interface StarsValue {
  stars: Star[];
  status: Status;
  /** True while a write is in flight. */
  pending: boolean;
  /** The most recently landed star — the jar flashes this one as it settles. */
  freshId: string | null;
  /** A paper colour to pre-select for the next star, rotating so it varies. */
  suggestedColor: StarColor;
  /**
   * Save a new star. Resolves to the stored star (or `null`) **without** adding
   * it to the jar — the caller plays the fold-and-drop, then calls `commitStar`.
   */
  addStar: (text: string, color: StarColor) => Promise<Star | null>;
  /** Drop a saved star into the jar once its fold animation has played out. */
  commitStar: (star: Star) => void;
  /** Rewrite a star's words and/or paper. Resolves `true` on success. */
  editStar: (id: string, text: string, color: StarColor) => Promise<boolean>;
  /** Take a star out of the jar, for good. */
  removeStar: (id: string) => Promise<boolean>;
  /** Retry the initial load after an error. */
  reload: () => void;
}

const StarsContext = createContext<StarsValue | null>(null);

/**
 * Owns the star jar's contents. Everything goes through `/api/stars`, so the
 * Supabase key stays on the server. The jar is shared (not per-device), so we
 * re-fetch whenever the tab regains focus.
 */
export function StarsProvider({ children }: { children: ReactNode }) {
  const [stars, setStars] = useState<Star[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [pending, setPending] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stars", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { stars: Star[] };
        if (cancelled) return;
        setStars(data.stars);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // The jar is shared — pick up the other person's writing when she comes back.
  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/stars", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { stars: Star[] };
        setStars(data.stars);
        setStatus("ready");
      } catch {
        // Keep whatever's on screen.
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  const reload = useCallback(() => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }, []);

  const addStar = useCallback(
    async (text: string, color: StarColor): Promise<Star | null> => {
      setPending(true);
      try {
        const res = await fetch("/api/stars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, color }),
        });
        if (!res.ok) return null;
        const { star } = (await res.json()) as { star: Star };
        return star;
      } catch {
        return null;
      } finally {
        setPending(false);
      }
    },
    [],
  );

  const commitStar = useCallback((star: Star) => {
    setStars((current) =>
      current.some((s) => s.id === star.id) ? current : [...current, star],
    );
    setFreshId(star.id);
  }, []);

  const editStar = useCallback(
    async (id: string, text: string, color: StarColor): Promise<boolean> => {
      const previous = stars;
      setPending(true);
      setStars((current) =>
        current.map((s) => (s.id === id ? { ...s, text, color } : s)),
      );
      try {
        const res = await fetch(`/api/stars/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, color }),
        });
        if (!res.ok) {
          setStars(previous);
          return false;
        }
        const { star } = (await res.json()) as { star: Star };
        setStars((current) => current.map((s) => (s.id === id ? star : s)));
        return true;
      } catch {
        setStars(previous);
        return false;
      } finally {
        setPending(false);
      }
    },
    [stars],
  );

  const removeStar = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = stars;
      setPending(true);
      setStars((current) => current.filter((s) => s.id !== id));
      if (freshId === id) setFreshId(null);
      try {
        const res = await fetch(`/api/stars/${id}`, { method: "DELETE" });
        if (!res.ok) {
          setStars(previous);
          return false;
        }
        return true;
      } catch {
        setStars(previous);
        return false;
      } finally {
        setPending(false);
      }
    },
    [stars, freshId],
  );

  const suggestedColor = STAR_COLORS[stars.length % STAR_COLORS.length];

  const value = useMemo<StarsValue>(
    () => ({
      stars,
      status,
      pending,
      freshId,
      suggestedColor,
      addStar,
      commitStar,
      editStar,
      removeStar,
      reload,
    }),
    [
      stars,
      status,
      pending,
      freshId,
      suggestedColor,
      addStar,
      commitStar,
      editStar,
      removeStar,
      reload,
    ],
  );

  return <StarsContext.Provider value={value}>{children}</StarsContext.Provider>;
}

export function useStars(): StarsValue {
  const context = useContext(StarsContext);
  if (!context) {
    throw new Error("useStars must be used within a StarsProvider");
  }
  return context;
}
