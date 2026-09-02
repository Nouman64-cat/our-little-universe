import "server-only";
import { unstable_cache } from "next/cache";
import { FALLBACK_POOL, type WhisperPool } from "./whispers";

/**
 * Generates the ambient-copy pool with OpenAI and caches it. The result is
 * shared by every visitor and refreshed at most a few times a day; the client
 * then picks different lines from it on each visit. If the key is missing or
 * the call fails for any reason, the built-in pool is used and nothing breaks.
 */

const MODEL = "gpt-4o-mini";
const CACHE_TTL_SECONDS = 60 * 60 * 6;
const REQUEST_TIMEOUT_MS = 12_000;

const SYSTEM_PROMPT = `You write tiny fragments of romantic micro-copy for a private, hand-made surprise website that a man is giving to his girlfriend. She loves lily flowers. The tone is intimate, understated, and a little playful — never greeting-card, never cheesy, no clichés ("you complete me", "my other half"), no emojis, no hashtags. Keep the language plain and warm. Vary the imagery; only occasionally reference lilies, spring, or flowers.`;

const USER_PROMPT = `Return a JSON object with exactly these keys and nothing else:
- "intros": array of 6 strings. Each is one gentle sentence that could introduce a small game. Reference tone: "First, I need you to catch something…". Max ~10 words.
- "gameHints": array of 5 strings. 2 to 4 words each, a soft instruction to tap falling hearts.
- "whispers": array of 16 strings. 2 to 6 words each, lowercase, no ending punctuation, like half-finished loving thoughts.`;

function cleanLine(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^["'\s]+|["'\s]+$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

function pickLines(value: unknown, max: number, maxWords: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(cleanLine)
    .filter((line): line is string => line !== null)
    .filter((line) => line.length <= 90 && line.split(/\s+/).length <= maxWords)
    .slice(0, max);
}

/** Accepts a raw model response and returns a pool, topping up any thin bucket. */
function sanitizePool(raw: unknown): WhisperPool {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const intros = pickLines(record.intros, 6, 12);
  const gameHints = pickLines(record.gameHints, 5, 5);
  const whispers = pickLines(record.whispers, 16, 7);

  // Always keep the canonical intro in rotation so the baseline tone is safe,
  // and top up from the fallback if the model was stingy.
  const modelIntros = intros.filter((line) => line !== FALLBACK_POOL.intros[0]);
  const introSource =
    modelIntros.length >= 2
      ? modelIntros
      : [...modelIntros, ...FALLBACK_POOL.intros.slice(1)];
  const introsWithAnchor = [FALLBACK_POOL.intros[0], ...introSource];

  return {
    intros: introsWithAnchor.slice(0, 6),
    gameHints:
      gameHints.length >= 2
        ? gameHints
        : [...gameHints, ...FALLBACK_POOL.gameHints].slice(0, 5),
    whispers:
      whispers.length >= 6
        ? whispers
        : [...whispers, ...FALLBACK_POOL.whispers].slice(0, 16),
  };
}

async function generatePool(): Promise<WhisperPool> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return FALLBACK_POOL;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`OpenAI responded ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty completion");

    return sanitizePool(JSON.parse(content));
  } catch (error) {
    console.warn(
      "[whispers] using built-in pool:",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_POOL;
  }
}

export const getWhisperPool = unstable_cache(generatePool, ["whisper-pool-v1"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: ["whispers"],
});
