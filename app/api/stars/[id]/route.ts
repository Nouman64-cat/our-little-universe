import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  isStarColor,
  rowToStar,
  sanitizeStarText,
  type StarRow,
} from "@/lib/stars";

export const dynamic = "force-dynamic";

const COLUMNS = "id, text, color, created_at, updated_at";

type Ctx = { params: Promise<{ id: string }> };

/** Rewrite a star's strip of paper. */
export async function PATCH(request: Request, ctx: Ctx) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "the jar isn't set up yet" }, { status: 503 });
  }

  const { id } = await ctx.params;

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

  const patch: { text: string; updated_at: string; color?: string } = {
    text,
    updated_at: new Date().toISOString(),
  };
  if (isStarColor(payload.color)) patch.color = payload.color;

  const { data, error } = await supabase
    .from("stars")
    .update(patch)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "couldn't find that star" }, { status: 404 });
  }

  return NextResponse.json({ star: rowToStar(data as StarRow) });
}

/** Take a star out of the jar, for good. */
export async function DELETE(_request: Request, ctx: Ctx) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "the jar isn't set up yet" }, { status: 503 });
  }

  const { id } = await ctx.params;
  const { error } = await supabase.from("stars").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "the star wouldn't budge" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
