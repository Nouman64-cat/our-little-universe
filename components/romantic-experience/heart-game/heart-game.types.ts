export type HeartTone = "rose" | "lavender" | "blush";

/** A rare golden heart is worth more and bursts bigger. */
export type HeartKind = "normal" | "gold";

/** One heart currently falling through the playfield. */
export interface FallingHeartData {
  id: string;
  /** Horizontal position as a percentage of the playfield width. */
  xPercent: number;
  /** Horizontal sway amplitude in pixels. */
  drift: number;
  /** Rendered size in pixels. */
  size: number;
  /** Total rotation over the fall, in degrees. */
  rotation: number;
  /** Time to fall from top to bottom, in seconds. */
  duration: number;
  tone: HeartTone;
  kind: HeartKind;
}

/** A short-lived sparkle burst spawned where a heart was caught. */
export interface BurstData {
  id: string;
  x: number;
  y: number;
  /** 1 = single catch, higher = mid-combo; scales the burst. */
  intensity: number;
  gold: boolean;
}

/** A "+N" score number that rises and fades from a catch point. */
export interface FloatData {
  id: string;
  x: number;
  y: number;
  text: string;
  gold: boolean;
}
