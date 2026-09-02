"use client";

import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { haptic } from "@/lib/utils";
import type { HubTab } from "@/types/experience";
import { NAV_ICONS } from "./nav-icons";

interface BottomNavProps {
  active: HubTab;
  onChange: (tab: HubTab) => void;
}

const TABS: HubTab[] = ["home", "sweets", "garden", "teddy", "us"];

/**
 * The persistent bottom navigation. Glass bar, five thumb-sized targets, a
 * single glowing dot that slides to the active tab.
 */
export function BottomNav({ active, onChange }: BottomNavProps) {
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-canvas/85 backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const Icon = NAV_ICONS[tab];
          const isActive = tab === active;
          return (
            <li key={tab} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  if (!isActive) haptic(4);
                  onChange(tab);
                }}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex min-h-[58px] w-full flex-col items-center justify-center gap-1 rounded-2xl pt-1.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60",
                  isActive ? "text-rose" : "text-ink-faint hover:text-ink-muted",
                ].join(" ")}
              >
                <span className="relative">
                  {isActive && (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "nav-dot"}
                      className="absolute -top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rose"
                      style={{ filter: "drop-shadow(0 0 4px rgba(255,158,196,0.9))" }}
                    />
                  )}
                  <Icon active={isActive} />
                </span>
                <span className="text-[10px] font-medium tracking-wide">
                  {copy.hub.nav[tab]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
