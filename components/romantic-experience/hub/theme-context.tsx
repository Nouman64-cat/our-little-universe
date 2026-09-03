"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

type Theme = "light" | "dark";

interface ThemeValue {
  /** The theme in effect right now. */
  theme: Theme;
  /** Flip to the opposite and remember it on this device. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const STORAGE_KEY = "olu:theme";
const THEME_COLORS: Record<Theme, string> = {
  dark: "#0d0912",
  light: "#fbf3f7",
};

/**
 * Her saved choice. Dark is the default until she taps the toggle — the hub no
 * longer follows the OS setting, so what she picks is what she gets.
 */
function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light"
      ? "light"
      : "dark";
  } catch {
    // Private mode / disabled storage — just start dark.
    return "dark";
  }
}

/**
 * Owns the hub's light/dark choice. The theme rides on `<html data-theme>` so
 * the page background, scrollbar and mobile browser chrome all move with it —
 * not just the hub subtree. Only the hub mounts this; the first-run journey and
 * the catching game have no `data-theme` and stay dark.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  // This provider only ever mounts on the client (behind the entry veil), so a
  // layout effect is safe here and avoids a first-frame flash of the old theme.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", THEME_COLORS[theme]);

    return () => {
      // Hand the document back to dark on the way out (e.g. replaying the journey).
      delete root.dataset.theme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", THEME_COLORS.dark);
    };
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Non-persisting is fine; the choice still holds for this visit.
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeValue>(() => ({ theme, toggle }), [theme, toggle]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/** A small sun/moon that swaps the hub between light and dark. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light" : "Switch to dark"}
      className="fixed right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-muted backdrop-blur-md transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <motion.span
        key={theme}
        className="block h-5 w-5"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -40, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
            <path
              d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
              fill="currentColor"
              opacity={0.9}
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
            <circle cx="12" cy="12" r="4.4" fill="currentColor" />
            <g
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9" />
            </g>
          </svg>
        )}
      </motion.span>
    </button>
  );
}
