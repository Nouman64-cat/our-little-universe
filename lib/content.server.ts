import "server-only";
import { unstable_cache } from "next/cache";
import { NICKNAME } from "./config";
import { FALLBACK_CONTENT, type SiteContent } from "./content";

/**
 * Generates the ambient-copy pool with OpenAI and caches it. The result is
 * shared by every visitor and refreshed a few times a day; the client then
 * picks lines from it per visit / per day. Missing key or any failure → the
 * hand-written pool, and nothing breaks.
 */

const MODEL = "gpt-4o-mini";
const CACHE_TTL_SECONDS = 60 * 60 * 6;
const REQUEST_TIMEOUT_MS = 15_000;

const SYSTEM_PROMPT = `You write tiny fragments of romantic micro-copy for a private, hand-made website a man made for his girlfriend, whom he calls "${NICKNAME}". She loves lily flowers, sweets, teddy bears, and the colour pink. The tone is intimate, understated, and a little playful — never greeting-card, never cheesy, no clichés ("you complete me", "my other half", "you are my everything"), no emojis, no hashtags, no exclamation-mark spam. Plain, warm, specific language. Vary the imagery; only sometimes lean on lilies, sweets, or spring.`;

const USER_PROMPT = `Return a JSON object with exactly these keys, each an array of short strings:
- "intros": 6 items. One gentle sentence each that could introduce a small game. Reference tone: "First, I need you to catch something…". Max ~10 words.
- "gameHints": 5 items. 2 to 4 words, a soft instruction to tap falling hearts.
- "whispers": 16 items. 2 to 6 words, lowercase, no ending punctuation, like half-finished loving thoughts.
- "resultReveals": 6 items. Teasing one-liners shown right after she's told how many hearts she caught in a game — the running joke is that he already gave her his heart / all of them. Warm, a little smug, max ~16 words. May end with "♡".
- "scratchMessages": 6 items. Short romantic declarations to hide under a scratch-off card. Reference: "I'd choose you in every lifetime." Max ~14 words. May end with "♡".
- "finales": 5 items. Each item is TWO lines joined by a newline ("\\n"): a very short first line (2–4 words) and a slightly longer second line about choosing her across time. Reference: "Still choosing you.\\nToday. Tomorrow. Every version of us.".
- "greetings": 6 items. One short sentence to show when she opens the site, warm and low-key.
- "sweets": 20 items. Small, specific reasons he adores her or things he loves that she does. Lowercase, no ending punctuation, max ~12 words.
- "lilies": 16 items. Tiny notes to tuck inside a flower in a garden that grows as she visits. Lowercase, no ending punctuation, max ~12 words.
- "teddyLines": 12 items. Very short lines a cute teddy bear might hold on a sign. Max ~8 words.
No commentary — only the JSON object.`;

type Bucket = keyof SiteContent;

interface BucketSpec {
  max: number;
  maxWords: number;
  min: number;
  /** Two-line entries ("line1\nline2") — word cap applies per line. */
  twoLine?: boolean;
  /** Always keep `FALLBACK_CONTENT[bucket][0]` first (his original wording). */
  pinOriginal?: boolean;
}

const SPECS: Record<Bucket, BucketSpec> = {
  intros: { max: 6, maxWords: 12, min: 3, pinOriginal: true },
  gameHints: { max: 5, maxWords: 5, min: 2 },
  whispers: { max: 16, maxWords: 7, min: 6 },
  resultReveals: { max: 7, maxWords: 20, min: 3, pinOriginal: true },
  scratchMessages: { max: 7, maxWords: 18, min: 3, pinOriginal: true },
  finales: { max: 6, maxWords: 12, min: 2, twoLine: true, pinOriginal: true },
  greetings: { max: 6, maxWords: 14, min: 3 },
  sweets: { max: 20, maxWords: 14, min: 8 },
  lilies: { max: 16, maxWords: 14, min: 8 },
  teddyLines: { max: 12, maxWords: 9, min: 5 },
};

function cleanLine(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^["'\s]+|["'\s]+$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

function withinWordCap(line: string, spec: BucketSpec): boolean {
  const parts = spec.twoLine ? line.split("\n") : [line];
  if (spec.twoLine && parts.length !== 2) return false;
  return parts.every(
    (part) => part.trim().length > 0 && part.trim().split(/\s+/).length <= spec.maxWords,
  );
}

function resolveBucket(raw: unknown, bucket: Bucket): string[] {
  const spec = SPECS[bucket];
  const fallback = FALLBACK_CONTENT[bucket];
  const cleaned = Array.isArray(raw)
    ? raw
        .map(cleanLine)
        .filter((line): line is string => line !== null)
        .filter((line) => line.length <= 160 && withinWordCap(line, spec))
        .slice(0, spec.max)
    : [];

  let merged = cleaned;
  if (cleaned.length < spec.min) {
    // Top up from the fallback, keeping whatever usable lines the model gave.
    merged = [...cleaned];
    for (const line of fallback) {
      if (merged.length >= spec.max) break;
      if (!merged.includes(line)) merged.push(line);
    }
  }

  if (spec.pinOriginal) {
    const original = fallback[0];
    merged = [original, ...merged.filter((line) => line !== original)].slice(0, spec.max);
  }
  return merged;
}

function sanitizeContent(raw: unknown): SiteContent {
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    intros: resolveBucket(record.intros, "intros"),
    gameHints: resolveBucket(record.gameHints, "gameHints"),
    whispers: resolveBucket(record.whispers, "whispers"),
    resultReveals: resolveBucket(record.resultReveals, "resultReveals"),
    scratchMessages: resolveBucket(record.scratchMessages, "scratchMessages"),
    finales: resolveBucket(record.finales, "finales"),
    greetings: resolveBucket(record.greetings, "greetings"),
    sweets: resolveBucket(record.sweets, "sweets"),
    lilies: resolveBucket(record.lilies, "lilies"),
    teddyLines: resolveBucket(record.teddyLines, "teddyLines"),
  };
}

async function generateContent(): Promise<SiteContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return FALLBACK_CONTENT;

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

    if (!response.ok) throw new Error(`OpenAI responded ${response.status}`);

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty completion");

    return sanitizeContent(JSON.parse(content));
  } catch (error) {
    console.warn(
      "[content] using built-in pool:",
      error instanceof Error ? error.message : error,
    );
    return FALLBACK_CONTENT;
  }
}

export const getSiteContent = unstable_cache(generateContent, ["site-content-v1"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: ["site-content"],
});
