/**
 * Real-world weather → the small set of moods the house scene reacts to. Pure
 * mapping only; the actual fetch lives server-side in `app/api/weather/route.ts`
 * (IP geolocation → Open-Meteo), both free and keyless.
 */

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export interface WeatherState {
  condition: WeatherCondition;
  /** Open-Meteo's own day/night flag for the location — independent of Pakistan time. */
  isDay: boolean;
  temperatureC: number | null;
  city: string | null;
}

export const FALLBACK_WEATHER: WeatherState = {
  condition: "clear",
  isDay: true,
  temperatureC: null,
  city: null,
};

/** Open-Meteo's WMO weather codes, collapsed into the categories above. */
export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if (code === 95 || code === 96 || code === 99) return "storm";
  return "clear";
}

/** "sunny", "foggy", "stormy" — a lowercase word for chips and captions. */
export function weatherLabel(condition: WeatherCondition, isDay: boolean): string {
  switch (condition) {
    case "clear":
      return isDay ? "sunny" : "clear";
    case "cloudy":
      return "cloudy";
    case "fog":
      return "foggy";
    case "drizzle":
      return "drizzling";
    case "rain":
      return "rainy";
    case "snow":
      return "snowy";
    case "storm":
      return "stormy";
  }
}
