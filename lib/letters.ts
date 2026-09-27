import { LETTERS, type Letter } from "./keepsakes";

/**
 * The letter box never runs dry. Letters `0 … LETTERS.length - 1` are the
 * hand-written ones in `keepsakes.ts`; every letter after that is new — written
 * fresh by the server (`/api/letter`) or, when that's unavailable, composed
 * here from hand-written pieces so it still works offline / without a key.
 */

/** The hand-written letter at `n`, or `null` once past them. */
export function handwrittenLetter(n: number): Letter | null {
  return n >= 0 && n < LETTERS.length ? LETTERS[n] : null;
}

/** A gentle thread for each new letter, rotated so neighbouring days differ. */
export const LETTER_THEMES = [
  "a tiny ordinary moment of hers he replays in his head",
  "what the 5th of May changed about his days",
  "how her voice sounds when she has missed him",
  "a promise about a small, boring future together",
  "the things he notices that she thinks nobody sees",
  "trying, again, to find a word big enough and failing sweetly",
  "being her safe place on a hard day",
  "lilies, and why they remind him of her",
  "choosing her again this morning, on purpose",
  "missing her while she's only in the next room",
  "what he'd tell the version of himself before her",
  "the sound of her laugh when she's caught off guard",
  "sweets, and how she's the sweetest part of any day",
  "falling asleep mid-conversation, and how he loves that",
  "a quiet thank-you for her patience with him",
  "imagining them old, still teasing each other",
  "how good news isn't real until he's told her",
  "the way she says his name",
  "a rainy day he'd happily spend doing nothing with her",
  "how the little house and garden here are all for her",
  "a soft apology for any day he didn't say it enough",
  "being proud of her, specifically",
  "her hands, and holding them",
  "the smallest habit of hers he'd miss the most",
] as const;

export function letterTheme(n: number): string {
  return LETTER_THEMES[(n * 7) % LETTER_THEMES.length];
}

// Pieces for the offline composer. Opening × middle × closing gives thousands
// of distinct letters; `composeLetter` walks them as a permutation so none
// repeats for years.
const OPENINGS = [
  "Chuchu,\n\nAnother day, another letter, and I still haven't found the right words. I'm starting to think that's the point.",
  "Chuchu,\n\nI woke up thinking about you, which isn't news, but it felt worth writing down anyway.",
  "My chuchu,\n\nI sat down to write something clever and ended up just smiling at the page for a while.",
  "Chuchu,\n\nThere's a new envelope in the box because there's a new day, and I love you a little differently in each one.",
  "Hi you,\n\nIf you're opening this, it means you came back again. I don't take that for granted. Not once.",
  "Chuchu,\n\nI keep a list of things I want to tell you and it only ever gets longer.",
  "Dear chuchu,\n\nToday I noticed how quiet everything gets when I'm not talking to you.",
  "Chuchu,\n\nI promised I'd keep writing. So here I am, keeping it.",
  "My love,\n\nSome days the feeling is loud and some days it's soft. Today it's soft, and it's everywhere.",
  "Chuchu,\n\nI tried to count the days since the 5th of May and lost track somewhere around \"all of them were better\".",
  "Chuchu,\n\nI don't have anything big to say today. Just the usual thing, which is the biggest thing I have.",
  "Hey chuchu,\n\nIf you're reading this half-asleep, good. That's one of my favourite versions of you.",
] as const;

const MIDDLES = [
  "I love the way you get quiet when you're thinking, like the whole world has to wait for you to finish. It should.",
  "You have this way of making the smallest things feel important — a text, a sweet, a flower in a made-up garden. You make them matter just by caring about them.",
  "I think about your laugh at the strangest times. In traffic. In line somewhere. It shows up out of nowhere and fixes my whole face.",
  "Loving you isn't something I do once and finish. It's more like breathing — I keep doing it without deciding to, and I'd be in trouble if I stopped.",
  "I don't need grand days with you. I want the ordinary ones — tea going cold because we got talking, your feet finding mine, nothing planned.",
  "When something good happens, you're the first place my mind runs. It doesn't feel real until it's yours too.",
  "You're softer than you let people see and stronger than you give yourself credit for. I get to see both, and I don't take it lightly.",
  "I've memorised so many little things about you and there are always more. You keep being new to me.",
  "If today was heavy, put some of it down here. I'll hold it for a while. That's what I'm for.",
  "You make being patient easy and being apart hard. I didn't know one person could do both.",
  "Every time I build something in this little universe, I'm really just thinking out loud about you.",
  "I'm proud of you in ways I don't say often enough — for how you keep going, how you care, how you stay gentle anyway.",
  "Lilies open slowly and all at once at the same time. That's how you happened to me.",
  "The best part of my day is usually a very small moment that has you in it.",
] as const;

const CLOSINGS = [
  "That's all for today. Tomorrow there'll be another, because there's always more.",
  "I'll keep trying to say it better. For now: I love you, completely.",
  "Come find me after you've read this. Or don't, and I'll come find you.",
  "Still choosing you. Today, and again tomorrow.",
  "No words are enough, so I'll just keep sending them.",
  "Go eat something sweet. You deserve it, and I said so.",
  "I love you more than yesterday, and yesterday was a lot.",
  "Keep this one close. I'll write the next one soon.",
  "Whatever today holds, you're not holding it alone.",
  "Since the 5th of May, and for good.",
  "Sleep well when you do. I'll be here in the morning, still yours.",
  "That's the letter. The feeling doesn't fit in it, but it tried.",
  "Thank you for being you. It's my favourite thing about the world.",
] as const;

const SIGNS = [
  "— cheeku",
  "— yours, cheeku",
  "— always, cheeku",
  "— yours",
  "— cheeku, still",
  "— yours since the 5th",
  "— your cheeku",
  "— always",
] as const;

const COMBOS = OPENINGS.length * MIDDLES.length * CLOSINGS.length;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// A stride coprime with COMBOS turns k → (k * STRIDE) % COMBOS into a
// permutation: every combination is used once before any repeats. Its
// mixed-radix digits are all non-zero (5 + 5·O + 5·O·M), so the opening, the
// middle and the closing each change from one day to the next.
const STRIDE = (() => {
  let s = 5 + 5 * OPENINGS.length + 5 * OPENINGS.length * MIDDLES.length;
  while (gcd(s, COMBOS) !== 1) s += 1;
  return s;
})();

/** A new letter composed from hand-written pieces — unique for every `n`. */
export function composeLetter(n: number): Letter {
  const k = Math.max(0, n - LETTERS.length);
  const i = (k * STRIDE + 7) % COMBOS;
  const opening = OPENINGS[i % OPENINGS.length];
  const middle = MIDDLES[Math.floor(i / OPENINGS.length) % MIDDLES.length];
  const closing =
    CLOSINGS[Math.floor(i / (OPENINGS.length * MIDDLES.length)) % CLOSINGS.length];
  return {
    body: `${opening}\n\n${middle} ${closing}`,
    sign: SIGNS[k % SIGNS.length],
  };
}

/** Shape-guard a letter coming back from the network. */
export function isLetter(value: unknown): value is Letter {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.body === "string" &&
    record.body.trim().length > 0 &&
    (record.sign === undefined || typeof record.sign === "string")
  );
}
