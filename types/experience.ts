/**
 * The ordered stages of the romantic journey. Each stage renders exactly one
 * screen; `RomanticExperience` drives the transitions between them.
 */
export type ExperienceStage =
  | "landing"
  | "game"
  | "result"
  | "scratch"
  | "hold"
  | "final";

/** The three "chapters" represented by the three hearts in the progress indicator. */
export type Chapter = 0 | 1 | 2;
