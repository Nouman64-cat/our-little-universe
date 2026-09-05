"use client";

import { useEffect, useState } from "react";
import type { WeatherState } from "@/lib/weather";

const REFRESH_MS = 15 * 60_000;

/**
 * The current weather at her location (IP-geolocated server-side, see
 * `app/api/weather/route.ts`). `null` until the first response lands, so
 * callers can render nothing rather than a wrong guess.
 */
export function useWeather(): WeatherState | null {
  const [weather, setWeather] = useState<WeatherState | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/weather");
        const data = (await res.json()) as WeatherState;
        if (!cancelled) setWeather(data);
      } catch {
        // Decorative feature — a failed fetch just leaves the previous (or no) reading.
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return weather;
}
