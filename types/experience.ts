/**
 * The ordered stages of the first-run romantic journey. Each stage renders one
 * screen; `Journey` drives the transitions between them.
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

/** Top level: the one-time journey, or the persistent hub she returns to. */
export type ExperienceMode = "journey" | "hub";

/** The bottom-nav destinations inside the hub. */
export type HubTab = "home" | "game" | "sweets" | "garden" | "teddy" | "us";
