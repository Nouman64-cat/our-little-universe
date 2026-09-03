/**
 * Your words. Everything in this file is shown exactly as written and is never
 * sent to or varied by any model at runtime. The letters below are a starting
 * draft in your voice — read them, then make them yours. Edit freely: add
 * letters, rewrite them, change the signature.
 */

export interface Letter {
  /** 2–4 sentences. Line breaks are respected. */
  body: string;
  /** Shown under the letter, right-aligned. */
  sign?: string;
}

export interface Moment {
  /** Any short label — a date, a season, a place. */
  when: string;
  /** One evocative line about it. */
  line: string;
}

/**
 * Cheeku → Chuchu. One sealed letter arrives each day; once it's opened it
 * doesn't come back, so each one is written to be read once and kept. They all
 * circle the same thing: there aren't words big enough, and here he is trying
 * anyway. It started on the 5th of May.
 */
export const LETTERS: Letter[] = [
  {
    body:
      "Chuchu,\n\nI've started this letter more times than I can count. Every version sounds too small. \"I love you\" is the biggest thing I know how to say and it still doesn't cover it.\n\nSo take this as the first attempt of many. I'm going to keep trying until one of them fits.",
    sign: "— cheeku",
  },
  {
    body:
      "The 5th of May keeps being the day my life split into before and after. Before you, I was fine. I didn't know I was only fine.\n\nI don't have the sentence for what you did to my ordinary days. Just know that they don't feel ordinary anymore.",
    sign: "— yours since that day",
  },
  {
    body:
      "People say \"words fail\" like it's a small thing. Mine fail me constantly around you. I'll be looking at you across a room and my whole vocabulary just quietly leaves.\n\nWhat's left is this: my chest goes warm, and I think, there she is. That's the closest I can get.",
    sign: "— cheeku",
  },
  {
    body:
      "I love you in a way that doesn't fit in a message. It's in how I plan my day around the sound of your voice. It's in the fact that good news isn't real to me until I've told you.\n\nIf I could hand you the feeling directly I would. This letter is the long way around.",
    sign: "— always, cheeku",
  },
  {
    body:
      "Some nights I lie awake trying to describe you to myself and give up and just listen to you breathe. That ends up being the better poem anyway.\n\nYou are the thing I stopped being able to explain and started being grateful for.",
    sign: "— yours",
  },
  {
    body:
      "I keep a running list in my head of things I love about you and it has no bottom. Your laugh when you're caught off guard. The face you make reading something sad. The way you say my name when you've missed me.\n\nEvery time I think I've reached the end of the list, you do something new.",
    sign: "— cheeku",
  },
  {
    body:
      "If you're reading this on a bad day: I love you at full volume even when you can't feel it. Nothing about that is conditional on you being okay.\n\nCome find me. Or don't, and let me come find you. Either way you're not carrying it alone.",
    sign: "— always",
  },
  {
    body:
      "I used to think love was a feeling that happened to you. With you it's a thing I get to do — on purpose, every morning, gladly.\n\nI'd choose it again right now. I choose it again every time I look up and you're there.",
    sign: "— yours, choosing you",
  },
  {
    body:
      "There's a version of me that existed before the 5th of May and honestly I don't miss him. He didn't know what he was waiting for.\n\nYou're what I was waiting for. I just didn't have the word for it until it had your face.",
    sign: "— cheeku",
  },
  {
    body:
      "I love you more than I have room to say and I've made my peace with never catching up to it. The feeling will always be bigger than the sentence.\n\nThat's not a failure. That's just how much there is.",
    sign: "— yours, hopelessly",
  },
  {
    body:
      "Thank you for being patient with me on the days I go quiet. It's never that I have less to say. It's that being near you is the one place I don't have to find the words at all.\n\nYou make silence feel like being held.",
    sign: "— cheeku",
  },
  {
    body:
      "If I ever seem like I'm staring, it's because I'm trying to memorise you — the exact you of that exact minute — in case I never get a better one. I always do. You keep outdoing yourself.\n\nI don't know how to love you less. I've tried. It doesn't take.",
    sign: "— always, cheeku",
  },
  {
    body:
      "Everything I've built you — the little house, the garden, the jar of sweets — is the same message in different shapes. It all says: I was thinking about you, and I couldn't sit still with the feeling.\n\nThis letter is just the one that says it plainly.",
    sign: "— yours",
  },
  {
    body:
      "I love the big things about you and I love the boring things more. Your terrible morning voice. How you reread texts you've already answered. The specific weight of you falling asleep against my arm.\n\nNobody warned me the small stuff would be the part that undoes me.",
    sign: "— cheeku",
  },
  {
    body:
      "Chuchu, I don't need our life to be extraordinary. I need you in the kitchen while I make tea. I need your feet cold against mine under the blanket. I need the ordinary Tuesday, as long as it's ours.\n\nThat's the whole ambition. You, and the regular days, forever.",
    sign: "— yours, still",
  },
  {
    body:
      "If you've read this far, you've read them all — every word I had ready. I'll keep writing. The feeling isn't going anywhere and neither am I.\n\nI never found the words that were enough. But I hope, put together, they add up to something close: I love you. Since the 5th of May. More than I can say, and for good.",
    sign: "— cheeku, always",
  },
];

// Replace these with real ones whenever you like — a date and a single line.
export const MOMENTS: Moment[] = [
  { when: "the first walk", line: "we ran out of street before we ran out of things to say" },
  { when: "that rainy week", line: "you fell asleep mid-sentence and I stayed up smiling" },
  { when: "the small kitchen", line: "burnt the first thing we cooked, kept the recipe anyway" },
  { when: "a grey morning", line: "you said my name like it was good news" },
  { when: "now", line: "still choosing you — today, and the next one" },
];
