"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pickOne } from "@/lib/utils";
import { STAR_COLORS, type Star, type StarColor } from "@/lib/stars";

type Status = "loading" | "ready" | "error";

interface StarsValue {
  stars: Star[];
  status: Status;
  /** True while a write is in flight. */
  pending: boolean;
  /** The most recently added star — the jar animates this one dropping in. */
  freshId: string | null;
  /** Fold a new star and drop it in. Resolves to the new star, or `null`. */
  addStar: (text: string) => Promise<Star | null>;
  /** Rewrite a star. Resolves `true` on success. */
  editStar: (id: string, text: string) => Promise<boolean>;
  /** Take a star out of the jar, for good. */
  removeStar: (id: string) => Promise<boolean>;
  /** Retry the initial load after an error. */
  reload: () => void;
}

const StarsContext = createContext<StarsValue | null>(null);

/** A fresh paper colour for each new star, avoiding an immediate repeat. */
function nextColor(previous: StarColor | null): StarColor {
  if (!previous) return pickOne(STAR_COLORS);
  const others = STAR_COLORS.filter((c) => c !== previous);
  return pickOne(others);
}

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
  const lastColorRef = useRef<StarColor | null>(null);

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

  const addStar = useCallback(async (text: string): Promise<Star | null> => {
    const color = nextColor(lastColorRef.current);
    setPending(true);
    try {
      const res = await fetch("/api/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, color }),
      });
      if (!res.ok) return null;
      const { star } = (await res.json()) as { star: Star };
      lastColorRef.current = star.color;
      setStars((current) => [...current, star]);
      setFreshId(star.id);
      return star;
    } catch {
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  const editStar = useCallback(
    async (id: string, text: string): Promise<boolean> => {
      const previous = stars;
      setPending(true);
      setStars((current) =>
        current.map((s) => (s.id === id ? { ...s, text } : s)),
      );
      try {
        const res = await fetch(`/api/stars/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
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

  const value = useMemo<StarsValue>(
    () => ({
      stars,
      status,
      pending,
      freshId,
      addStar,
      editStar,
      removeStar,
      reload,
    }),
    [stars, status, pending, freshId, addStar, editStar, removeStar, reload],
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
