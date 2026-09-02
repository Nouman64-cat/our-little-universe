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
import { motion, useReducedMotion } from "motion/react";

type ThemePref = "light" | "dark" | "system";
type Theme = "light" | "dark";

interface ThemeValue {
  /** The theme actually in effect right now. */
  theme: Theme;
  /** What she picked — `"system"` until she taps the toggle. */
  pref: ThemePref;
  /** Flip to the opposite of what's showing and remember it. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const STORAGE_KEY = "olu:theme";
const THEME_COLORS: Record<Theme, string> = {
  dark: "#0d0912",
  light: "#fbf3f7",
};

function readPref(): ThemePref {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Private mode / disabled storage — fall back to following the system.
  }
  return "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
}

/**
 * Owns the hub's light/dark choice. Defaults to following the device, and
 * remembers an explicit pick on the device. Only the hub is wrapped in this —
 * the first-run journey stays dark regardless.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemePref>(readPref);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  // Track the OS setting so "system" stays live without a reload.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme: Theme =
    pref === "system" ? (systemDark ? "dark" : "light") : pref;

  // Keep the mobile browser chrome in step with the hub.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
    return () => {
      const el = document.querySelector('meta[name="theme-color"]');
      if (el) el.setAttribute("content", THEME_COLORS.dark);
    };
  }, [theme]);

  const toggle = useCallback(() => {
    setPref((current) => {
      const showing =
        current === "system" ? (systemPrefersDark() ? "dark" : "light") : current;
      const next: Theme = showing === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Non-persisting is fine; the choice still holds for this visit.
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({ theme, pref, toggle }),
    [theme, pref, toggle],
  );

  return (
    <div className={theme === "light" ? "theme-light" : "theme-dark"}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </div>
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
