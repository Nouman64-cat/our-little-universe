"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import type { HubTab } from "@/types/experience";
import { BottomNav } from "./BottomNav";
import { GameTab } from "./GameTab";
import { GardenTab } from "./GardenTab";
import { HomeTab } from "./HomeTab";
import { HubBackdrop } from "./HubBackdrop";
import { SweetsTab } from "./SweetsTab";
import { TeddyTab } from "./TeddyTab";
import { ThemeProvider, ThemeToggle } from "./theme-context";
import { UsTab } from "./UsTab";

interface HubProps {
  onReplayJourney: () => void;
}

/** The persistent hub: a tab under a bottom nav, each its own little room. */
export function Hub({ onReplayJourney }: HubProps) {
  const [tab, setTab] = useState<HubTab>("home");

  return (
    <ThemeProvider>
      <div className="relative min-h-dvh text-ink">
        <HubBackdrop />
        {tab !== "game" && <ThemeToggle />}

        <AnimatePresence mode="wait">
          {tab === "home" && (
            <HomeTab key="home" onNavigate={setTab} onReplayJourney={onReplayJourney} />
          )}
          {tab === "game" && <GameTab key="game" />}
          {tab === "sweets" && <SweetsTab key="sweets" />}
          {tab === "garden" && <GardenTab key="garden" />}
          {tab === "teddy" && <TeddyTab key="teddy" />}
          {tab === "us" && <UsTab key="us" />}
        </AnimatePresence>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </ThemeProvider>
  );
}
