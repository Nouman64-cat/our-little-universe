/**
 * Shared types + the hand-written fallback for the AI-varied *ambient* copy.
 * Client-safe — never touches the API key. Generation lives in `content.server.ts`.
 *
 * Only playful, ambient microcopy is varied here. The emotional anchors are
 * fixed elsewhere: the three journey messages in `config.ts`, and the love
 * letters + moments in `keepsakes.ts` (your words, never AI-touched).
 */
export interface SiteContent {
  /** One-line intros for the opening screen. */
  intros: string[];
  /** 2–4 word prompts shown during the catching game. */
  gameHints: string[];
  /** Half-finished loving thoughts that drift past during the game. */
  whispers: string[];
  /**
   * Teasing one-liners revealed after the hearts-game score — the joke being
   * that he already gave her his. Index 0 is the original, always kept.
   */
  resultReveals: string[];
  /**
   * Short romantic declarations hidden under the scratch card. Index 0 is the
   * original, always kept.
   */
  scratchMessages: string[];
  /**
   * The closing message — each entry is two lines separated by "\n". Index 0 is
   * the original, always kept.
   */
  finales: string[];
  /** Second line under the time-of-day greeting on the hub home screen. */
  greetings: string[];
  /** What's inside a candy in the sweets jar — a reason, a nudge, a tiny compliment. */
  sweets: string[];
  /** Short notes tucked inside the garden lilies. */
  lilies: string[];
  /** What the teddy's little sign says. */
  teddyLines: string[];
}

export const FALLBACK_CONTENT: SiteContent = {
  intros: [
    "First, I need you to catch something…",
    "Before anything else — hold out your hands.",
    "Something's falling. Keep as much as you can.",
    "There's a little game first. Humor me.",
    "Start here. I'll explain in a moment.",
    "Catch a few of these for me first.",
  ],
  gameHints: [
    "Tap the hearts",
    "Catch what falls",
    "Reach for them",
    "Gather a few",
    "Keep them close",
  ],
  whispers: [
    "you're my favorite hello",
    "still choosing this",
    "you make rooms warmer",
    "like lilies after rain",
    "my calmest thought",
    "home, but a person",
    "you, always you",
    "the good kind of quiet",
    "i'd do it all again",
    "soft morning, your voice",
    "every version of us",
    "you feel like spring",
    "the best part of today",
    "lucky, and knowing it",
    "your hand, then everything else",
    "petals open slower than this",
  ],
  resultReveals: [
    "Unfortunately, I already gave you all of mine. ♡",
    "Impressive. Sadly, mine's been yours for a while now. ♡",
    "Good hands. Shame — you already hold the only one that counts. ♡",
    "Nice haul. Mine was spoken for the day I met you. ♡",
    "You're quick. Too late for mine, though — it's yours. ♡",
    "Not bad. Mine? Already packed up and moved in with you. ♡",
    "Careful with those. The important one's non-refundable, and it's yours. ♡",
  ],
  scratchMessages: [
    "I'd choose you in every lifetime. ♡",
    "Every version of this story still ends with you. ♡",
    "Given every choice again, still you. Every single time. ♡",
    "You're the answer I keep arriving at. ♡",
    "In every life where I get to pick — I pick you. ♡",
    "Of all the ways it could have gone, I want the one with you. ♡",
  ],
  finales: [
    "Still choosing you.\nToday. Tomorrow. Every version of us.",
    "Still you.\nThis morning, tonight, and whatever comes after.",
    "Choosing you again.\nQuietly, on purpose, every ordinary day.",
    "It's still you.\nThe easy answer, and the one I'd give forever.",
    "You, again.\nNow, later, and every version I get to keep.",
  ],
  greetings: [
    "the day got better just now.",
    "i was hoping you'd come by.",
    "thinking about you, as usual.",
    "you found your way back. good.",
    "this little place missed you.",
    "hi. that's it. just hi.",
  ],
  sweets: [
    "the way you laugh with your whole face",
    "you always save me the last bite",
    "your hand finding mine without looking",
    "how you hum when you're happy",
    "you make ordinary days feel chosen",
    "the little sigh you do before you smile",
    "you listen like it matters, because it does",
    "your cold feet, my problem now",
    "you remember the small things i say",
    "mornings are better with your voice in them",
    "you're kind when no one's watching",
    "the face you make at bad puns",
    "you feel like a warm room",
    "you never make me feel like too much",
    "how you say my name when you're sleepy",
    "you, being exactly this",
    "the way you tuck your hair back",
    "you turn errands into dates",
    "your playlists live in my head now",
    "you make me want to be softer",
  ],
  lilies: [
    "grew a little today, like us",
    "a good day to be yours",
    "still leaning toward you, like light",
    "planted because you crossed my mind",
    "for the ordinary tuesday i loved you on",
    "opening slow, like everything worth it",
    "you'd like the way this one turned out",
    "quiet proof i was thinking of you",
    "one more day, one more bloom",
    "the garden keeps your name",
    "small, stubborn, and pink — like my heart for you",
    "here before the sun was, waiting for you",
    "keep coming back and watch it fill in",
    "roots go where you are",
    "a soft thing, on purpose",
    "today counted. here's the flower to prove it",
  ],
  teddyLines: [
    "she's the best one. tell her.",
    "hug available. no charge.",
    "holding this spot for you.",
    "i also think about her a lot.",
    "you're doing great. she thinks so too.",
    "press me if today was long.",
    "officially on your team.",
    "warm hugs, restocked daily.",
    "she said pink. i listened.",
    "here whenever, for as long as.",
    "small bear, large feelings.",
    "you are extremely loved. that's the update.",
  ],
};
