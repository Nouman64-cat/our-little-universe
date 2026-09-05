import { NextResponse } from "next/server";
import { FALLBACK_WEATHER, weatherCodeToCondition, type WeatherState } from "@/lib/weather";

// Depends on the caller's IP — never statically cache this route itself.
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 4_000;
const PRIVATE_IP = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

interface IpGeoResponse {
  status: "success" | "fail";
  lat?: number;
  lon?: number;
  city?: string;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    is_day?: 0 | 1;
  };
}

/** The visitor's IP from the proxy chain — `x-forwarded-for` may list several, hers is the first. */
function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip");
}

/**
 * Free, keyless weather for wherever she's opening the site from: IP → rough
 * location (ip-api.com) → current conditions (Open-Meteo). Any failure along
 * the way just falls back to a plain "clear" reading rather than an error —
 * this is decorative, not load-bearing.
 */
export async function GET(request: Request) {
  try {
    const ip = clientIp(request);
    // In local dev there's no public IP to geolocate; ip-api.com without an
    // address falls back to geolocating the outgoing (server) connection.
    const geoUrl =
      ip && !PRIVATE_IP.test(ip)
        ? `http://ip-api.com/json/${ip}?fields=status,lat,lon,city`
        : "http://ip-api.com/json/?fields=status,lat,lon,city";

    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const geo = (await geoRes.json()) as IpGeoResponse;
    if (geo.status !== "success" || geo.lat == null || geo.lon == null) {
      return NextResponse.json(FALLBACK_WEATHER);
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const data = (await weatherRes.json()) as OpenMeteoResponse;
    const current = data.current;
    if (!current || typeof current.weather_code !== "number") {
      return NextResponse.json(FALLBACK_WEATHER);
    }

    const state: WeatherState = {
      condition: weatherCodeToCondition(current.weather_code),
      isDay: current.is_day !== 0,
      temperatureC:
        typeof current.temperature_2m === "number" ? Math.round(current.temperature_2m) : null,
      city: geo.city ?? null,
    };

    // Short private cache — this is per-visitor (IP-derived), so it must
    // never be shared across users, only reused for her own next few loads.
    return NextResponse.json(state, {
      headers: { "Cache-Control": "private, max-age=600" },
    });
  } catch {
    return NextResponse.json(FALLBACK_WEATHER);
  }
}
