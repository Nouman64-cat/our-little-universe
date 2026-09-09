import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * A Supabase client for the star jar, created lazily so the rest of the site
 * still builds and runs when the project isn't configured (mirrors how the
 * OpenAI key is optional). The key is a **publishable / anon** key and is only
 * ever read here, on the server — it never reaches the browser. Row Level
 * Security on the `stars` table is what actually scopes what it can touch.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Whether the star jar has somewhere to store stars. */
export const isStarsConfigured = Boolean(url && key);
