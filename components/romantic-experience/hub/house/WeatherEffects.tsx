"use client";

import { motion, useReducedMotion } from "motion/react";
import type { WeatherCondition } from "@/lib/weather";

interface WeatherEffectsProps {
  condition: WeatherCondition;
}

/** Fixed, hand-tuned positions so the effect is identical on server and client — see `AmbientBackground`. */
const RAIN_STREAKS = [
  { left: "4%", delay: 0, duration: 0.85 },
  { left: "14%", delay: 0.32, duration: 0.7 },
  { left: "24%", delay: 0.08, duration: 0.95 },
  { left: "34%", delay: 0.5, duration: 0.75 },
  { left: "44%", delay: 0.18, duration: 0.65 },
  { left: "54%", delay: 0.44, duration: 0.9 },
  { left: "64%", delay: 0.02, duration: 0.8 },
  { left: "74%", delay: 0.36, duration: 0.7 },
  { left: "84%", delay: 0.22, duration: 0.85 },
  { left: "94%", delay: 0.58, duration: 0.75 },
  { left: "9%", delay: 0.66, duration: 0.6 },
  { left: "39%", delay: 0.12, duration: 0.7 },
  { left: "69%", delay: 0.48, duration: 0.65 },
  { left: "89%", delay: 0.3, duration: 0.8 },
] as const;

const SNOWFLAKES = [
  { left: "6%", size: 4, delay: 0, duration: 9, drift: 18 },
  { left: "16%", size: 3, delay: 1.4, duration: 11, drift: -14 },
  { left: "26%", size: 5, delay: 2.8, duration: 8, drift: 20 },
  { left: "36%", size: 3, delay: 0.6, duration: 10, drift: -16 },
  { left: "46%", size: 4, delay: 3.6, duration: 9.5, drift: 14 },
  { left: "56%", size: 3, delay: 1.9, duration: 11.5, drift: -18 },
  { left: "66%", size: 5, delay: 0.3, duration: 8.5, drift: 16 },
  { left: "76%", size: 3, delay: 2.4, duration: 10.5, drift: -12 },
  { left: "86%", size: 4, delay: 4.1, duration: 9, drift: 18 },
  { left: "96%", size: 3, delay: 1.1, duration: 11, drift: -20 },
  { left: "11%", size: 3, delay: 3.2, duration: 9.8, drift: 12 },
  { left: "51%", size: 4, delay: 0.9, duration: 10.2, drift: -14 },
] as const;

const FOG_BANDS = [
  { top: "16%", height: "22%", delay: 0, duration: 34, from: "-30%", to: "30%" },
  { top: "42%", height: "26%", delay: 6, duration: 40, from: "20%", to: "-30%" },
  { top: "66%", height: "20%", delay: 12, duration: 30, from: "-20%", to: "25%" },
] as const;

const MOOD_WASH: Record<WeatherCondition, string> = {
  clear: "transparent",
  cloudy: "rgba(90, 100, 118, 0.08)",
  fog: "rgba(232, 236, 240, 0.38)",
  drizzle: "rgba(70, 90, 120, 0.12)",
  rain: "rgba(60, 78, 108, 0.2)",
  snow: "rgba(255, 255, 255, 0.14)",
  storm: "rgba(18, 22, 36, 0.34)",
};

/**
 * A weather-reactive layer over the house's outdoor scene: falling rain or
 * snow, drifting fog, an occasional lightning flash in a storm — driven by
 * `useWeather()`'s real reading for wherever she's opening the site from.
 * `clear`/`cloudy` add only a faint tint; the existing sky already carries
 * those moods (sun, stars, drifting clouds).
 */
export function WeatherEffects({ condition }: WeatherEffectsProps) {
  const reduceMotion = useReducedMotion();
  const showRain = condition === "rain" || condition === "drizzle" || condition === "storm";
  const heavy = condition === "rain" || condition === "storm";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: MOOD_WASH[condition] }} />

      {/*
       * `y`/`x` below travel in `vh`/`vw` rather than `%` on purpose: a
       * percentage on a `transform` resolves against the *element's own*
       * size, not its container, so a thin streak or a tiny flake barely
       * moves. Viewport units give every particle the same real travel
       * distance regardless of how small it is — see `AmbientBackground`'s
       * petals, which use the same trick.
       */}
      {showRain &&
        !reduceMotion &&
        RAIN_STREAKS.map((r, i) => (
          <motion.span
            key={i}
            className="absolute top-[-8%] block w-px"
            style={{
              left: r.left,
              height: heavy ? "14%" : "9%",
              background:
                "linear-gradient(to bottom, transparent, rgba(191,214,240,0.75), transparent)",
            }}
            animate={{ y: ["0vh", "115vh"] }}
            transition={{
              duration: (heavy ? 1 : 1.7) * r.duration,
              delay: r.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

      {condition === "snow" &&
        !reduceMotion &&
        SNOWFLAKES.map((f, i) => (
          <motion.span
            key={i}
            className="absolute top-[-6%] block rounded-full"
            style={{ left: f.left, width: f.size, height: f.size, background: "rgba(255,255,255,0.85)" }}
            animate={{ y: ["0vh", "112vh"], x: [0, f.drift, 0] }}
            transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}

      {condition === "fog" &&
        FOG_BANDS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute inset-x-[-20%] rounded-full blur-2xl"
            style={{ top: b.top, height: b.height, background: "rgba(255,255,255,0.32)" }}
            animate={reduceMotion ? undefined : { x: [b.from, b.to] }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {condition === "storm" && !reduceMotion && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.5, 0, 0.18, 0, 0] }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            times: [0, 0.55, 0.57, 0.6, 0.63, 0.66, 1],
            ease: "easeOut",
          }}
        />
      )}
    </div>
  );
}
