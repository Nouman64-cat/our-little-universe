"use client";

import { motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/config";
import { haptic } from "@/lib/utils";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { BallroomScene } from "./BallroomScene";
import { useTheme } from "./theme-context";
import { TabScreen } from "./ui/TabScreen";

/** Path to the looping waltz. Drop the file in `public/` at this name. */
const MUSIC_SRC = "/castle-waltz.mp3";

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {on ? (
        <path
          d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="m17 9 5 6M22 9l-5 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/** The midnight ball: a castle ballroom scene with a looping waltz. */
export function CastleTab() {
  const reduceMotion = useReducedMotion();
  const { ref, playing, toggle } = useAmbientAudio();
  const { theme } = useTheme();
  const strings = copy.hub.castle;
  const light = theme === "light";

  return (
    <TabScreen bare>
      <div className="relative min-h-dvh w-full overflow-hidden">
        <BallroomScene />

        <audio ref={ref} src={MUSIC_SRC} loop preload="auto" />

        {/* scrims for the floated chrome */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b to-transparent ${
            light ? "from-white/55 via-white/20" : "from-black/35 via-black/12"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent ${
            light ? "from-white/60 via-white/20" : "from-black/40 via-black/12"
          }`}
        />

        {/* title */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+2.75rem)] text-center"
        >
          <h1
            className={`font-display text-2xl font-medium ${
              light
                ? "text-ink [text-shadow:0_2px_14px_rgba(255,255,255,0.7)]"
                : "text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]"
            }`}
          >
            {strings.title}
          </h1>
          <p
            className={`mt-1 font-display text-sm italic ${
              light
                ? "text-ink-muted [text-shadow:0_2px_12px_rgba(255,255,255,0.7)]"
                : "text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]"
            }`}
          >
            {strings.subtitle}
          </p>
        </motion.div>

        {/* music toggle — a small collapsed control, top-left */}
        <motion.button
          type="button"
          onClick={() => {
            haptic(6);
            toggle();
          }}
          aria-pressed={playing}
          aria-label={playing ? strings.musicOn : strings.musicOff}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`absolute left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/60 ${
            light
              ? "border-hairline bg-surface text-ink-muted hover:text-ink"
              : "border-white/25 bg-black/40 text-white/90 hover:bg-black/55"
          }`}
        >
          <SpeakerIcon on={playing} />
        </motion.button>

        {/* the line, small at the foot */}
        <motion.p
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className={`pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] px-6 text-center font-display text-sm italic ${
            light
              ? "text-ink-muted [text-shadow:0_1px_8px_rgba(255,255,255,0.7)]"
              : "text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]"
          }`}
        >
          {strings.line}
        </motion.p>
      </div>
    </TabScreen>
  );
}
