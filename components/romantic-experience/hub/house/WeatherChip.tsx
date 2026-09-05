"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";
import { weatherLabel, type WeatherState } from "@/lib/weather";
import { WeatherIcon } from "./WeatherIcon";

/** A small visual-only weather indicator on Home — the icon alone, no wording on screen. `null` until it loads. */
export function WeatherChip({ weather }: { weather: WeatherState | null }) {
  const reduceMotion = useReducedMotion();
  if (!weather) return null;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_SOFT, delay: 0.3 }}
      role="img"
      aria-label={weatherLabel(weather.condition, weather.isDay)}
      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/35 backdrop-blur-md"
    >
      <WeatherIcon condition={weather.condition} isDay={weather.isDay} className="h-5 w-5" />
    </motion.div>
  );
}
