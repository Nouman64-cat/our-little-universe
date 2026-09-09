import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  rowToStar,
  sanitizeStarText,
  isStarColor,
  type StarRow,
} from "@/lib/stars";

// The jar's contents change as she writes — never statically cache this.
export const dynamic = "force-dynamic";

const COLUMNS = "id, text, color, created_at, updated_at";

/** Every star in the jar, oldest first (they pile up from the bottom). */
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ stars: [] });

  const { data, error } = await supabase
    .from("stars")
    .select(COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "could not open the jar" }, { status: 502 });
  }

  return NextResponse.json(
    { stars: (data as StarRow[]).map(rowToStar) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Fold a new star and drop it in. */
export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "the jar isn't set up yet" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "malformed request" }, { status: 400 });
  }

  const payload = body as { text?: unknown; color?: unknown };
  const text = sanitizeStarText(payload.text);
  if (!text) {
    return NextResponse.json({ error: "write something first" }, { status: 400 });
  }
  const color = isStarColor(payload.color) ? payload.color : "petal";

  const { data, error } = await supabase
    .from("stars")
    .insert({ text, color })
    .select(COLUMNS)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "the star slipped" }, { status: 502 });
  }

  return NextResponse.json({ star: rowToStar(data as StarRow) }, { status: 201 });
}
