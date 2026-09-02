"use client";

import { motion } from "motion/react";
import { copy } from "@/lib/config";
import { EASE_SOFT } from "@/lib/motion";
import type { HubTab } from "@/types/experience";
import { CandyIcon } from "../ui/CandyIcon";
import { HeartIcon } from "../ui/HeartIcon";
import { LilyIcon } from "../ui/LilyIcon";
import { useKeepsakes } from "./keepsake-context";
import { TabScreen } from "./ui/TabScreen";

interface HomeTabProps {
  onNavigate: (tab: HubTab) => void;
  onReplayJourney: () => void;
}

function QuickCard({
  onClick,
  icon,
  label,
  hint,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose/15">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink-faint">{hint}</span>
      </span>
    </button>
  );
}

/** The hub landing: a greeting, two things "for today", and the garden at a glance. */
export function HomeTab({ onNavigate, onReplayJourney }: HomeTabProps) {
  const { nickname, timeGreeting, greetingLine, blooms, streak, sweetTaken } =
    useKeepsakes();

  const recentBlooms = blooms.slice(-5);

  return (
    <TabScreen>
      <div className="flex flex-1 flex-col">
        <motion.p
          className="text-xs uppercase tracking-[0.3em] text-ink-faint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SOFT }}
        >
          welcome back
        </motion.p>

        <motion.h1
          className="mt-3 font-display text-3xl font-medium capitalize text-ink"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.1 }}
        >
          {timeGreeting}, {nickname}.
        </motion.h1>

        <motion.p
          suppressHydrationWarning
          className="mt-3 text-base leading-relaxed text-ink-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.2 }}
        >
          {greetingLine}
        </motion.p>

        <motion.div
          className="mt-8 grid gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.32 }}
        >
          <QuickCard
            onClick={() => onNavigate("sweets")}
            icon={<CandyIcon className="h-6 w-6" />}
            label={copy.hub.sweets.ofTheDay}
            hint={sweetTaken ? "opened — there's more in the jar" : "still wrapped"}
          />
          <QuickCard
            onClick={() => onNavigate("us")}
            icon={<HeartIcon className="h-5 w-5 text-rose" />}
            label={copy.hub.us.letterLabel}
            hint="in the Us tab"
          />
        </motion.div>

        <motion.button
          type="button"
          onClick={() => onNavigate("garden")}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.42 }}
        >
          <span className="flex -space-x-1.5">
            {recentBlooms.length > 0 ? (
              recentBlooms.map((bloom) => (
                <LilyIcon key={bloom.id} className="h-7 w-7" />
              ))
            ) : (
              <LilyIcon className="h-7 w-7 opacity-40" />
            )}
          </span>
          <span>
            <span className="block text-sm font-medium text-ink">
              {blooms.length} {blooms.length === 1 ? "lily" : "lilies"}
            </span>
            <span className="block text-xs text-ink-faint">
              {streak > 1 ? `${streak} days in a row` : "tap to visit"}
            </span>
          </span>
        </motion.button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onReplayJourney}
          className="mx-auto mt-10 text-sm text-ink-faint underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60"
        >
          {copy.hub.home.replay}
        </button>
      </div>
    </TabScreen>
  );
}
