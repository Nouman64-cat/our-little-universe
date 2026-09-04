/**
 * Pure date math for the "monthiversary" countdown — every calculation here
 * is anchored to Pakistan time (Asia/Karachi, fixed UTC+5, no DST), so the
 * countdown lands on the right moment no matter what timezone the page is
 * viewed from. See `components/romantic-experience/anniversary/`.
 */

const PK_TIMEZONE = "Asia/Karachi";
/** Pakistan Standard Time has no DST — the UTC+5 offset never shifts. */
const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

/** The day it all began. */
export const ANNIVERSARY_START = { year: 2026, month: 5, day: 5 } as const;
/** Every month's anniversary lands on this day-of-month. */
const ANNIVERSARY_DAY = ANNIVERSARY_START.day;

export interface PakistanNow {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number; // 0–23
  minute: number;
  second: number;
  weekday: string; // "Friday"
}

/** Current wall-clock date/time in Pakistan, independent of the viewer's own timezone. */
export function getPakistanNow(date: Date = new Date()): PakistanNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PK_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const num = (type: Intl.DateTimeFormatPartTypes) => Number(get(type));

  return {
    year: num("year"),
    month: num("month"),
    day: num("day"),
    // Midnight can come back as "24" under hour12: false in some engines.
    hour: num("hour") % 24,
    minute: num("minute"),
    second: num("second"),
    weekday: get("weekday"),
  };
}

/** Absolute epoch ms for 00:00:00 Pakistan time on a given Pakistan-calendar date. */
export function pakistanMidnightEpoch(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day, 0, 0, 0) - PK_OFFSET_MS;
}

export interface AnniversaryState {
  /** Whole months since the start, at the next upcoming monthiversary. */
  monthCount: number;
  targetYear: number;
  targetMonth: number;
  /** Absolute epoch ms of the next monthiversary (00:00 Pakistan time). */
  targetEpoch: number;
  /** True for the whole Pakistan calendar day of a monthiversary. */
  isAnniversaryToday: boolean;
  /** Whole months elapsed as of today — meaningful when `isAnniversaryToday`. */
  todayMonthCount: number;
}

function addMonth(year: number, month: number): { year: number; month: number } {
  const m = month + 1;
  return m > 12 ? { year: year + 1, month: 1 } : { year, month: m };
}

/** Where "now" (Pakistan time) sits relative to the recurring monthly anniversary. */
export function getAnniversaryState(pk: Pick<PakistanNow, "year" | "month" | "day">): AnniversaryState {
  const { year: cy, month: cm, day: cd } = pk;

  // Once we've reached the 5th this month, the next monthiversary rolls to
  // next month; before that, it's still this month's 5th.
  const next = cd >= ANNIVERSARY_DAY ? addMonth(cy, cm) : { year: cy, month: cm };
  const monthCount =
    (next.year - ANNIVERSARY_START.year) * 12 + (next.month - ANNIVERSARY_START.month);

  const isAnniversaryToday =
    cd === ANNIVERSARY_DAY && !(cy === ANNIVERSARY_START.year && cm === ANNIVERSARY_START.month);
  const todayMonthCount = (cy - ANNIVERSARY_START.year) * 12 + (cm - ANNIVERSARY_START.month);

  return {
    monthCount,
    targetYear: next.year,
    targetMonth: next.month,
    targetEpoch: pakistanMidnightEpoch(next.year, next.month, ANNIVERSARY_DAY),
    isAnniversaryToday,
    todayMonthCount,
  };
}

function subMonth(year: number, month: number): { year: number; month: number } {
  const m = month - 1;
  return m < 1 ? { year: year - 1, month: 12 } : { year, month: m };
}

/**
 * The Pakistan-time window `[start, end]` the current wait falls inside — the
 * previous monthiversary (or the very start, whichever is later) through the
 * next one. Used to drive a progress bar for "how far into the wait" we are.
 */
export function anniversaryWindow(state: AnniversaryState): { startEpoch: number; endEpoch: number } {
  const prev = subMonth(state.targetYear, state.targetMonth);
  const startOfStart = pakistanMidnightEpoch(
    ANNIVERSARY_START.year,
    ANNIVERSARY_START.month,
    ANNIVERSARY_START.day,
  );
  const prevEpoch = pakistanMidnightEpoch(prev.year, prev.month, ANNIVERSARY_DAY);
  return { startEpoch: Math.max(startOfStart, prevEpoch), endEpoch: state.targetEpoch };
}

/** Split a millisecond duration into whole days/hours/minutes/seconds (floored, never negative). */
export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** "October 5" for the given target — defaults to the recurring anniversary day. */
export function formatAnniversaryDate(month: number, day: number = ANNIVERSARY_DAY): string {
  return `${MONTH_NAMES[month - 1]} ${day}`;
}
