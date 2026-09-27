import { NextResponse } from "next/server";
import { getLetter } from "@/lib/letters.server";

export const dynamic = "force-dynamic";

// Far more letters than anyone could open — one a day for ~270 years.
const MAX_LETTER = 100_000;

/** GET /api/letter?n=16 → `{ body, sign }` — the n-th letter in the box (0-based). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("n");
  const n = raw !== null && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isSafeInteger(n) || n > MAX_LETTER) {
    return NextResponse.json({ error: "bad letter number" }, { status: 400 });
  }
  const letter = await getLetter(n);
  return NextResponse.json(letter, {
    headers: { "Cache-Control": "private, max-age=86400" },
  });
}
