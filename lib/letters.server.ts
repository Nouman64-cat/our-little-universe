import "server-only";
import { unstable_cache } from "next/cache";
import { NICKNAME } from "./config";
import { LETTERS, type Letter } from "./keepsakes";
import { composeLetter, handwrittenLetter, isLetter, letterTheme } from "./letters";

/**
 * Writes the endless tail of the letter box. Letter `n` past the hand-written
 * ones is generated once with OpenAI and cached for good under `n`, so every
 * device sees the same letter for the same number and it never changes. No key
 * or any failure → a composed letter (and the failure isn't cached, so the
 * next request tries the model again).
 */

const MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_BODY_CHARS = 900;

// A handful of his real letters so the new ones match the voice.
const EXAMPLES = [0, 3, 5, 14]
  .map((i) => LETTERS[i])
  .filter(Boolean)
  .map((letter) => `${letter.body}\n${letter.sign ?? ""}`)
  .join("\n\n---\n\n");

const SYSTEM_PROMPT = `You write short private love letters from a man called Cheeku to his girlfriend, whom he calls "${NICKNAME}". They've been together since the 5th of May. She loves lilies, sweets, teddy bears and pink. One letter arrives in a keepsake box each day and is read once. The running thread: no words are ever big enough, and he keeps trying anyway.

Voice: intimate, understated, specific, a little playful. Plain warm language. No clichés ("you complete me", "my other half", "my everything"), no emojis, no exclamation-mark spam, not greeting-card. Here are letters he wrote himself — match this voice, but never reuse their sentences:

${EXAMPLES}`;

function userPrompt(n: number): string {
  return `Write letter number ${n + 1}. Its theme: ${letterTheme(n)}.
Make it feel new — a fresh image or small detail, not a rephrasing of the examples.
Usually open with "Chuchu," (or a close variant) on its own line, then a blank line. 2 short paragraphs, 50–110 words total, paragraphs separated by a blank line.
Return a JSON object: {"body": "<the letter>", "sign": "<a short sign-off starting with an em dash, like \\"— cheeku\\">"}. Only the JSON.`;
}

function clean(raw: unknown): Letter | null {
  if (!isLetter(raw)) return null;
  const body = raw.body.replace(/\r\n/g, "\n").trim();
  if (body.length < 60 || body.length > MAX_BODY_CHARS) return null;
  const sign = raw.sign?.trim();
  return {
    body,
    sign: sign ? (sign.startsWith("—") ? sign : `— ${sign}`).slice(0, 40) : "— cheeku",
  };
}

async function generateLetter(n: number): Promise<Letter> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("no OPENAI_API_KEY");

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
        { role: "user", content: userPrompt(n) },
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

  const letter = clean(JSON.parse(content));
  if (!letter) throw new Error("letter failed validation");
  return letter;
}

// Throws on failure so a fallback never gets cached in place of a real letter.
const cachedLetter = unstable_cache(generateLetter, ["daily-letter-v1"], {
  revalidate: false,
  tags: ["daily-letter"],
});

export async function getLetter(n: number): Promise<Letter> {
  const handwritten = handwrittenLetter(n);
  if (handwritten) return handwritten;
  try {
    return await cachedLetter(n);
  } catch (error) {
    console.warn(
      "[letters] composing letter",
      n,
      error instanceof Error ? error.message : error,
    );
    return composeLetter(n);
  }
}
